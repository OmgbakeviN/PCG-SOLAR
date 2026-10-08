import { ArrowRight, Eye, FolderTree, PackageCheck, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'

export default function AdminDashboardPage() {
  const { products, categories } = useProducts()
  const published = products.filter((product) => product.published).length
  const featured = products.filter((product) => product.featured && product.published).length

  const stats = [
    { label: 'Produits', value: products.length, icon: PackageCheck },
    { label: 'Publiés', value: published, icon: Eye },
    { label: 'En vedette', value: featured, icon: Star },
    { label: 'Catégories', value: categories.length, icon: FolderTree },
  ]

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-pcg-blue">Administration</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-pcg-ink">Tableau de bord</h1>
          <p className="mt-2 text-sm text-slate-500">Vue rapide du catalogue actuellement présenté sur le site.</p>
        </div>
        <Link to="/admin/produits/nouveau" className="btn-primary">Ajouter un produit <ArrowRight size={17} /></Link>
      </div>

      <div className="mt-9 grid border-y border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }, index) => (
          <div key={label} className={`p-6 ${index > 0 ? 'sm:border-l sm:border-slate-200' : ''} ${index > 1 ? 'border-t border-slate-200 xl:border-t-0' : ''}`}>
            <Icon size={22} className="text-pcg-blue" />
            <p className="mt-8 text-4xl font-extrabold tracking-[-0.04em] text-pcg-ink">{value}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-5 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-pcg-ink">Produits récents</h2>
            <p className="mt-1 text-sm text-slate-500">Les premiers éléments de votre catalogue.</p>
          </div>
          <Link to="/admin/produits" className="text-sm font-extrabold text-pcg-blue">Tout gérer</Link>
        </div>

        <div className="divide-y divide-slate-100">
          {products.slice(0, 5).map((product) => (
            <div key={product.id} className="grid gap-3 py-5 sm:grid-cols-[72px_1fr_auto] sm:items-center">
              <img src={product.image} alt="" className="h-16 w-16 bg-slate-50 object-contain p-1" />
              <div>
                <p className="font-extrabold text-pcg-ink">{product.name}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{product.category}</p>
              </div>
              <span className={`text-xs font-bold uppercase tracking-[0.1em] ${product.published ? 'text-emerald-600' : 'text-slate-400'}`}>
                {product.published ? 'Publié' : 'Masqué'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
