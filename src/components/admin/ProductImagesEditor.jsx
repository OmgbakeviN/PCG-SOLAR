import { ImagePlus, Star, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const LIMIT = 8
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export default function ProductImagesEditor({
  images = [], mainImageKey, queuedFiles, onQueueChange,
  onChooseMain, onDeleteImage, busy = false, disabled = false, onMessage,
}) {
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    const items = queuedFiles.map((file) => ({ file, url: URL.createObjectURL(file) }))
    setPreviews(items)
    return () => items.forEach((item) => URL.revokeObjectURL(item.url))
  }, [queuedFiles])

  const selectFiles = (event) => {
    const selected = Array.from(event.target.files || [])
    event.target.value = ''
    if (!selected.length) return
    const invalid = selected.find((file) => !ALLOWED.includes(file.type) || !file.size || file.size > MAX_BYTES)
    if (invalid) {
      onMessage('Chaque photo doit être au format JPEG, PNG ou WebP et peser moins de 5 Mo.')
      return
    }
    if (selected.length + queuedFiles.length + images.length > LIMIT) {
      onMessage(`Tu peux enregistrer au maximum ${LIMIT} photos par produit.`)
      return
    }
    onMessage('')
    onQueueChange([...queuedFiles, ...selected])
  }

  return (
    <section className="bg-white p-6">
      <h2 className="text-lg font-extrabold text-pcg-ink">Photos du produit</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Jusqu’à 8 photos · JPEG, PNG, WebP · 5 Mo chacune. La première photo devient principale.
      </p>

      <label className={`mt-5 flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-bold text-pcg-blue transition hover:border-pcg-blue ${busy || disabled ? 'pointer-events-none opacity-50' : ''}`}>
        <ImagePlus size={19} /> Choisir des photos
        <input type="file" className="sr-only" multiple accept="image/jpeg,image/png,image/webp"
          disabled={busy || disabled || images.length + queuedFiles.length >= LIMIT} onChange={selectFiles} />
      </label>

      {images.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3">
        {images.map((image) => {
          const main = mainImageKey === image.object_key
          return (
            <div key={image.id} className={`border bg-slate-50 p-2 ${main ? 'border-pcg-blue' : 'border-slate-200'}`}>
              <img src={image.url} alt={image.alt_text || 'Photo du produit'} className="aspect-square w-full object-contain" />
              {main && <div className="mt-2 flex items-center gap-1 text-[11px] font-extrabold text-pcg-blue"><Star size={13} fill="currentColor" /> Photo principale</div>}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                {!main && <button type="button" disabled={busy || disabled} onClick={() => onChooseMain(image.id)} className="text-xs font-bold text-pcg-blue disabled:opacity-50">Mettre en avant</button>}
                <button type="button" disabled={busy || disabled} onClick={() => onDeleteImage(image.id)} className="ml-auto text-xs font-bold text-red-600 disabled:opacity-50" aria-label="Supprimer cette photo"><Trash2 size={16} /></button>
              </div>
            </div>
          )
        })}
      </div>}

      {previews.length > 0 && <>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">À envoyer lors de l’enregistrement</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {previews.map((item, index) => <div key={`${item.file.name}-${index}`} className="relative border border-amber-200 bg-amber-50 p-2">
            <img src={item.url} alt={item.file.name} className="aspect-square w-full object-contain" />
            <p className="mt-1 truncate text-xs text-slate-600" title={item.file.name}>{item.file.name}</p>
            <button type="button" disabled={busy || disabled} onClick={() => onQueueChange(queuedFiles.filter((file) => file !== item.file))}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center bg-white text-red-600" aria-label="Retirer cette photo"><X size={14} /></button>
          </div>)}
        </div>
      </>}

      {!images.length && !previews.length && <p className="mt-4 text-xs text-slate-500">Aucune photo pour le moment. Le catalogue affiche une illustration temporaire.</p>}
    </section>
  )
}
