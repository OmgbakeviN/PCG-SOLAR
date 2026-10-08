import { Outlet } from 'react-router-dom'
import { CatalogProvider } from '../context/CatalogContext'
import Footer from './Footer'
import Header from './Header'

export default function PublicLayout() {
  return (
    <CatalogProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </CatalogProvider>
  )
}
