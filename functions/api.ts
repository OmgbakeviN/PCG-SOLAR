import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { Pool } from 'pg'
import { putImage, deleteImage, publicImageUrl } from './storage'

const app = new Hono()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
})

const authJwksUrl = process.env.NEON_AUTH_JWKS_URL
const authBaseUrl = process.env.NEON_AUTH_BASE_URL

const jwks = authJwksUrl ? createRemoteJWKSet(new URL(authJwksUrl)) : null
const issuer = authBaseUrl ? new URL(authBaseUrl).origin : null

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

async function requireAdmin(c) {
  if (!jwks || !issuer) {
    console.error('Neon Auth environment variables are missing in the Function runtime.')
    return {
      ok: false,
      response: c.json(
        {
          success: false,
          message: "La configuration Neon Auth du backend est incomplète.",
        },
        500,
      ),
    }
  }

  const authorization = c.req.header('Authorization')

  if (!authorization?.toLowerCase().startsWith('bearer ')) {
    return {
      ok: false,
      response: c.json(
        {
          success: false,
          message: 'Authentification requise.',
        },
        401,
      ),
    }
  }

  let userId

  try {
    const token = authorization.slice(7).trim()
    const { payload } = await jwtVerify(token, jwks, { issuer })

    if (!payload.sub) {
      throw new Error('JWT without subject')
    }

    userId = payload.sub
  } catch (error) {
    console.error('JWT verification failed:', error)
    return {
      ok: false,
      response: c.json(
        {
          success: false,
          message: 'Session invalide ou expirée.',
        },
        401,
      ),
    }
  }

  const result = await pool.query(
    `
      SELECT
        au.user_id,
        au.role,
        au.is_active,
        u.email,
        u.name
      FROM admin_users au
      INNER JOIN neon_auth."user" u
        ON u.id = au.user_id
      WHERE au.user_id = $1
        AND au.is_active = TRUE
      LIMIT 1
    `,
    [userId],
  )

  if (result.rows.length === 0) {
    return {
      ok: false,
      response: c.json(
        {
          success: false,
          message: "Ce compte n'est pas autorisé à administrer PCG SOLAR.",
        },
        403,
      ),
    }
  }

  return {
    ok: true,
    admin: result.rows[0],
  }
}

// Convert the stored object keys to public-read URLs, keeping S3 credentials server-side.
async function attachImages(rows) {
  if (!rows.length) return rows
  const ids = rows.map((row) => String(row.id))
  const result = await pool.query(
    `SELECT id, product_id, object_key, alt_text, position
     FROM product_images WHERE product_id = ANY($1::bigint[])
     ORDER BY position ASC, id ASC`, [ids],
  )
  const grouped = new Map()
  for (const image of result.rows) {
    const id = String(image.product_id)
    if (!grouped.has(id)) grouped.set(id, [])
    grouped.get(id).push({
      id: String(image.id), object_key: image.object_key,
      alt_text: image.alt_text || '', position: image.position,
      url: publicImageUrl(image.object_key),
    })
  }
  return rows.map((row) => ({
    ...row,
    main_image_url: publicImageUrl(row.main_image_key),
    images: grouped.get(String(row.id)) || [],
  }))
}

/* ========================================
   HEALTH CHECK
======================================== */

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'PCG Solar API is running',
  })
})

app.get('/health', async (c) => {
  const result = await pool.query('SELECT NOW() AS server_time')

  return c.json({
    success: true,
    service: 'PCG Solar API',
    database: 'connected',
    serverTime: result.rows[0].server_time,
  })
})

/* ========================================
   CATEGORIES - PUBLIC
======================================== */

app.get('/categories', async (c) => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      slug,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE is_active = TRUE
    ORDER BY name ASC
  `)

  return c.json({
    success: true,
    data: result.rows,
  })
})

/* ========================================
   PRODUCTS - PUBLIC
======================================== */

app.get('/products', async (c) => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.short_description,
      p.description,
      p.price,
      p.currency,
      p.brand,
      p.power,
      p.warranty,
      p.availability,
      p.featured,
      p.published,
      p.main_image_key,
      p.specifications,
      p.created_at,
      p.updated_at,

      json_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug
      ) AS category

    FROM products p

    INNER JOIN categories c
      ON c.id = p.category_id

    WHERE
      p.published = TRUE
      AND c.is_active = TRUE

    ORDER BY p.created_at DESC
  `)

  return c.json({
    success: true,
    count: result.rowCount,
    data: await attachImages(result.rows),
  })
})

app.get('/products/:slug', async (c) => {
  const slug = c.req.param('slug')

  const result = await pool.query(
    `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.price,
        p.currency,
        p.brand,
        p.power,
        p.warranty,
        p.availability,
        p.featured,
        p.published,
        p.main_image_key,
        p.specifications,
        p.created_at,
        p.updated_at,

        json_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug
        ) AS category

      FROM products p

      INNER JOIN categories c
        ON c.id = p.category_id

      WHERE
        p.slug = $1
        AND p.published = TRUE
        AND c.is_active = TRUE

      LIMIT 1
    `,
    [slug],
  )

  if (result.rows.length === 0) {
    return c.json(
      {
        success: false,
        message: 'Produit introuvable',
      },
      404,
    )
  }

  return c.json({
    success: true,
    data: (await attachImages(result.rows))[0],
  })
})

/* ========================================
   ADMIN - PROTECTED
======================================== */

app.get('/admin/me', async (c) => {
  const authorization = await requireAdmin(c)

  if (!authorization.ok) {
    return authorization.response
  }

  const admin = authorization.admin

  return c.json({
    success: true,
    data: {
      id: admin.user_id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.is_active,
    },
  })
})

/* ========================================
   ADMIN CRUD — all routes below require a signed Neon Auth JWT
   AND an active row in public.admin_users.
======================================== */

function adminRoute(method, path, handler) {
  app[method](path, async (c) => {
    const auth = await requireAdmin(c)
    if (!auth.ok) return auth.response
    return handler(c, auth.admin)
  })
}

function invalid(c, message, status = 400) {
  return c.json({ success: false, message }, status)
}

async function getBody(c) {
  try {
    const body = await c.req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null
    return body
  } catch {
    return null
  }
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function isId(value) {
  return typeof value === 'string' && /^[1-9]\d{0,17}$/.test(value)
}

function parseCategoryPatch(body, isCreate) {
  const values = {}
  if (isCreate || Object.hasOwn(body, 'name')) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 120) {
      throw new Error('Le nom de catégorie est obligatoire (120 caractères maximum).')
    }
    values.name = body.name.trim()
  }
  if (isCreate || Object.hasOwn(body, 'slug') || Object.hasOwn(body, 'name')) {
    const candidate = body.slug || body.name || ''
    const slug = slugify(candidate)
    if (!slug || slug.length > 140) throw new Error('Le slug de catégorie est invalide.')
    values.slug = slug
  }
  if (isCreate || Object.hasOwn(body, 'description')) {
    if (body.description != null && typeof body.description !== 'string') throw new Error('Description invalide.')
    values.description = (body.description || '').trim()
  }
  if (isCreate || Object.hasOwn(body, 'is_active')) {
    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') throw new Error('Statut de catégorie invalide.')
    values.is_active = body.is_active !== false
  }
  return values
}

const validAvailability = ['available', 'out_of_stock', 'on_order']

function parseProductPatch(body, isCreate) {
  const values = {}
  if (isCreate || Object.hasOwn(body, 'name')) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 180) {
      throw new Error('Le nom du produit est obligatoire (180 caractères maximum).')
    }
    values.name = body.name.trim()
  }
  if (isCreate || Object.hasOwn(body, 'slug') || Object.hasOwn(body, 'name')) {
    const slug = slugify(body.slug || body.name || '')
    if (!slug || slug.length > 200) throw new Error('Le slug produit est invalide.')
    values.slug = slug
  }
  if (isCreate || Object.hasOwn(body, 'category_id')) {
    if (!isId(String(body.category_id ?? ''))) throw new Error('Sélectionne une catégorie valide.')
    values.category_id = String(body.category_id)
  }
  for (const [key, max] of [['short_description', 5000], ['description', 30000], ['brand', 120], ['power', 100], ['warranty', 120]]) {
    if (isCreate || Object.hasOwn(body, key)) {
      if (body[key] != null && (typeof body[key] !== 'string' || body[key].length > max)) {
        throw new Error(`Champ ${key} invalide.`)
      }
      values[key] = (body[key] || '').trim()
    }
  }
  if (isCreate || Object.hasOwn(body, 'price')) {
    const input = body.price
    if (input === '' || input === null || input === undefined) values.price = null
    else if (!/^\d{1,12}(\.\d{1,2})?$/.test(String(input))) {
      throw new Error('Le prix doit être un montant positif, avec au maximum deux décimales.')
    } else values.price = String(input)
  }
  if (isCreate || Object.hasOwn(body, 'availability')) {
    const value = body.availability || 'available'
    if (!validAvailability.includes(value)) throw new Error('Disponibilité invalide.')
    values.availability = value
  }
  for (const key of ['featured', 'published']) {
    if (isCreate || Object.hasOwn(body, key)) {
      if (body[key] !== undefined && typeof body[key] !== 'boolean') throw new Error(`Champ ${key} invalide.`)
      values[key] = isCreate ? body[key] === true : body[key]
    }
  }
  if (isCreate || Object.hasOwn(body, 'specifications')) {
    const specs = body.specifications ?? {}
    if (!specs || typeof specs !== 'object' || Array.isArray(specs)) throw new Error('Caractéristiques invalides.')
    values.specifications = JSON.stringify(specs)
  }
  return values
}

// Whitelisted column names only; actual user values are always bound as SQL parameters.
async function saveRow(table, values, id = null) {
  const keys = Object.keys(values)
  if (!keys.length) throw new Error('Aucune modification fournie.')
  const args = keys.map((key) => values[key])
  const casts = keys.map((key, i) => `$${i + 1}${key === 'specifications' ? '::jsonb' : ''}`)
  if (id === null) {
    const result = await pool.query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${casts.join(', ')}) RETURNING id`, args,
    )
    return result.rows[0].id
  }
  args.push(id)
  const assignments = keys.map((key, i) => `${key} = ${casts[i]}`).join(', ')
  const result = await pool.query(
    `UPDATE ${table} SET ${assignments} WHERE id = $${args.length} RETURNING id`, args,
  )
  return result.rows[0]?.id || null
}

async function safeMutation(c, task) {
  try {
    return await task()
  } catch (error) {
    if (error.code === '23505') return invalid(c, 'Ce nom ou slug est déjà utilisé.', 409)
    if (error.code === '23503') return invalid(c, 'Cette catégorie est utilisée ou n’existe pas.', 409)
    if (error.code === '23514' || error.code === '22P02' || error.code === '22001') return invalid(c, 'Données invalides.', 400)
    // Explicit validation errors are safe to return; do not leak SQL or stack traces.
    if (!error.code && error instanceof Error && error.message && error.name === 'Error' && error.message !== 'Aucune modification fournie.') {
      const known = /^(Le |La |Champ |Description |Sélectionne |Disponibilité |Statut |Caractéristiques )/.test(error.message)
      if (known) return invalid(c, error.message, 400)
    }
    console.error('PCG Solar admin mutation:', error)
    return invalid(c, 'Une erreur interne est survenue.', 500)
  }
}

const productSelect = `
  SELECT p.id, p.name, p.slug, p.short_description, p.description, p.price,
         p.currency, p.brand, p.power, p.warranty, p.availability,
         p.featured, p.published, p.main_image_key, p.specifications,
         p.created_at, p.updated_at,
         json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category
  FROM products p JOIN categories c ON c.id = p.category_id
`

adminRoute('get', '/admin/categories', async (c) => {
  const result = await pool.query('SELECT id, name, slug, description, is_active, created_at, updated_at FROM categories ORDER BY name')
  return c.json({ success: true, data: result.rows })
})

adminRoute('get', '/admin/products', async (c) => {
  const result = await pool.query(`${productSelect} ORDER BY p.created_at DESC`)
  return c.json({ success: true, data: await attachImages(result.rows) })
})

adminRoute('post', '/admin/categories', async (c) => safeMutation(c, async () => {
  const body = await getBody(c)
  if (!body) return invalid(c, 'Requête JSON invalide.')
  const id = await saveRow('categories', parseCategoryPatch(body, true))
  return c.json({ success: true, data: { id } }, 201)
}))

adminRoute('patch', '/admin/categories/:id', async (c) => safeMutation(c, async () => {
  const id = c.req.param('id')
  if (!isId(id)) return invalid(c, 'Identifiant invalide.')
  const body = await getBody(c)
  if (!body) return invalid(c, 'Requête JSON invalide.')
  const values = parseCategoryPatch(body, false)
  if (!Object.keys(values).length) return invalid(c, 'Aucune modification fournie.')
  const savedId = await saveRow('categories', values, id)
  if (!savedId) return invalid(c, 'Catégorie introuvable.', 404)
  return c.json({ success: true, data: { id: savedId } })
}))

adminRoute('delete', '/admin/categories/:id', async (c) => safeMutation(c, async () => {
  const id = c.req.param('id')
  if (!isId(id)) return invalid(c, 'Identifiant invalide.')
  const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id])
  if (!result.rowCount) return invalid(c, 'Catégorie introuvable.', 404)
  return c.json({ success: true })
}))

adminRoute('post', '/admin/products', async (c) => safeMutation(c, async () => {
  const body = await getBody(c)
  if (!body) return invalid(c, 'Requête JSON invalide.')
  const id = await saveRow('products', parseProductPatch(body, true))
  return c.json({ success: true, data: { id } }, 201)
}))

adminRoute('patch', '/admin/products/:id', async (c) => safeMutation(c, async () => {
  const id = c.req.param('id')
  if (!isId(id)) return invalid(c, 'Identifiant invalide.')
  const body = await getBody(c)
  if (!body) return invalid(c, 'Requête JSON invalide.')
  const values = parseProductPatch(body, false)
  if (!Object.keys(values).length) return invalid(c, 'Aucune modification fournie.')
  const savedId = await saveRow('products', values, id)
  if (!savedId) return invalid(c, 'Produit introuvable.', 404)
  return c.json({ success: true, data: { id: savedId } })
}))

adminRoute('delete', '/admin/products/:id', async (c) => safeMutation(c, async () => {
  const id = c.req.param('id')
  if (!isId(id)) return invalid(c, 'Identifiant invalide.')
  const images = await pool.query('SELECT object_key FROM product_images WHERE product_id = $1', [id])
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id])
  if (!result.rowCount) return invalid(c, 'Produit introuvable.', 404)
  // The database is authoritative; log any orphaned storage objects for later cleanup.
  for (const image of images.rows) {
    try { await deleteImage(image.object_key) }
    catch (error) { console.error('Orphan image after product removal:', image.object_key, error) }
  }
  return c.json({ success: true })
}))

/* ========================================
   IMAGE MANAGEMENT - JWT + admin_users required
======================================== */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_IMAGES_PER_PRODUCT = 8

// Reject SVG, GIF and unknown formats; check actual file signature, not only MIME.
function detectImageType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: 'jpg', mime: 'image/jpeg' }
  }
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)) {
    return { extension: 'png', mime: 'image/png' }
  }
  if (bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP') {
    return { extension: 'webp', mime: 'image/webp' }
  }
  return null
}

adminRoute('get', '/admin/products/:id/images', async (c) => {
  const id = c.req.param('id')
  if (!isId(id)) return invalid(c, 'Identifiant invalide.')
  const rows = await pool.query('SELECT id, main_image_key FROM products WHERE id = $1', [id])
  if (!rows.rowCount) return invalid(c, 'Produit introuvable.', 404)
  const [product] = await attachImages(rows.rows)
  return c.json({ success: true, data: {
    images: product.images,
    main_image_key: product.main_image_key,
    main_image_url: product.main_image_url,
  } })
})

adminRoute('post', '/admin/products/:id/images', async (c) => {
  const id = c.req.param('id')
  if (!isId(id)) return invalid(c, 'Identifiant invalide.')
  const contentLength = Number(c.req.header('content-length') || 0)
  if (contentLength > MAX_IMAGE_BYTES + 64 * 1024) return invalid(c, 'Fichier trop volumineux (5 Mo maximum).', 413)
  let form
  try { form = await c.req.raw.formData() }
  catch { return invalid(c, 'Envoi multipart invalide.') }
  const file = form.get('image')
  if (!(file instanceof File)) return invalid(c, 'Sélectionne une photo valide.')
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) return invalid(c, 'Photo vide ou supérieure à 5 Mo.', 413)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const detected = detectImageType(bytes)
  if (!detected || file.type !== detected.mime) return invalid(c, 'Formats autorisés : JPEG, PNG, WebP.', 400)
  const altText = String(form.get('alt_text') || '').trim().slice(0, 255)

  const client = await pool.connect()
  let key = null
  try {
    await client.query('BEGIN')
    const product = await client.query('SELECT id, main_image_key FROM products WHERE id = $1 FOR UPDATE', [id])
    if (!product.rowCount) { await client.query('ROLLBACK'); return invalid(c, 'Produit introuvable.', 404) }
    const existing = await client.query('SELECT count(*)::integer AS total, coalesce(max(position), -1)::integer AS last_position FROM product_images WHERE product_id = $1', [id])
    if (existing.rows[0].total >= MAX_IMAGES_PER_PRODUCT) {
      await client.query('ROLLBACK')
      return invalid(c, 'Maximum de 8 photos par produit.', 409)
    }
    key = `products/${id}/${crypto.randomUUID()}.${detected.extension}`
    await putImage(key, bytes, detected.mime)
    const position = existing.rows[0].last_position + 1
    const img = await client.query(
      `INSERT INTO product_images (product_id, object_key, alt_text, position)
       VALUES ($1,$2,$3,$4) RETURNING id, object_key, alt_text, position`,
      [id, key, altText, position],
    )
    const isFirst = !product.rows[0].main_image_key
    if (isFirst) await client.query('UPDATE products SET main_image_key = $1 WHERE id = $2', [key, id])
    await client.query('COMMIT')
    return c.json({ success: true, data: {
      id: String(img.rows[0].id), object_key: key, alt_text: altText,
      position, url: publicImageUrl(key), is_main: isFirst,
    } }, 201)
  } catch (error) {
    try { await client.query('ROLLBACK') } catch {}
    if (key) { try { await deleteImage(key) } catch (cleanupError) { console.error('Storage rollback cleanup failed:', cleanupError) } }
    console.error('Upload product image:', error)
    return invalid(c, 'Impossible d’enregistrer la photo dans Neon Object Storage.', 500)
  } finally { client.release() }
})

adminRoute('patch', '/admin/products/:id/images/:imageId/main', async (c) => {
  const { id, imageId } = c.req.param()
  if (!isId(id) || !isId(imageId)) return invalid(c, 'Identifiant invalide.')
  const result = await pool.query(
    `UPDATE products SET main_image_key = (
       SELECT object_key FROM product_images WHERE id = $2 AND product_id = $1
     ) WHERE id = $1 AND EXISTS (
       SELECT 1 FROM product_images WHERE id = $2 AND product_id = $1
     ) RETURNING main_image_key`, [id, imageId],
  )
  if (!result.rowCount) return invalid(c, 'Photo introuvable.', 404)
  return c.json({ success: true, data: { main_image_key: result.rows[0].main_image_key } })
})

adminRoute('delete', '/admin/products/:id/images/:imageId', async (c) => {
  const { id, imageId } = c.req.param()
  if (!isId(id) || !isId(imageId)) return invalid(c, 'Identifiant invalide.')
  const client = await pool.connect()
  let key
  let mainKey
  try {
    await client.query('BEGIN')
    const product = await client.query('SELECT main_image_key FROM products WHERE id = $1 FOR UPDATE', [id])
    if (!product.rowCount) { await client.query('ROLLBACK'); return invalid(c, 'Produit introuvable.', 404) }
    const image = await client.query('SELECT object_key FROM product_images WHERE id = $1 AND product_id = $2', [imageId, id])
    if (!image.rowCount) { await client.query('ROLLBACK'); return invalid(c, 'Photo introuvable.', 404) }
    key = image.rows[0].object_key
    await client.query('DELETE FROM product_images WHERE id = $1 AND product_id = $2', [imageId, id])
    mainKey = product.rows[0].main_image_key
    if (mainKey === key) {
      const next = await client.query('SELECT object_key FROM product_images WHERE product_id = $1 ORDER BY position, id LIMIT 1', [id])
      mainKey = next.rows[0]?.object_key || null
      await client.query('UPDATE products SET main_image_key = $1 WHERE id = $2', [mainKey, id])
    }
    await client.query('COMMIT')
  } catch (error) {
    try { await client.query('ROLLBACK') } catch {}
    console.error('Removing product image:', error)
    return invalid(c, 'Suppression impossible.', 500)
  } finally { client.release() }
  try { await deleteImage(key) }
  catch (error) { console.error('Orphan storage image (delete failed):', key, error) }
  return c.json({ success: true, data: { main_image_key: mainKey } })
})

/* ========================================
   ERROR HANDLER
======================================== */

app.onError((error, c) => {
  console.error(error)

  return c.json(
    {
      success: false,
      message: 'Une erreur interne est survenue.',
    },
    500,
  )
})

export default app
