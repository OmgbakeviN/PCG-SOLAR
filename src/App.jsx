import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import ScrollToTop from './components/ScrollToTop'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute'
import { ProductProvider } from './context/ProductContext'
import HomePage from './pages/HomePage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import ShopPage from './pages/ShopPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminSetupPage from './pages/admin/AdminSetupPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProductProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/boutique" element={<ShopPage />} />
            <Route path="/boutique/:slug" element={<ProductDetailsPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/setup" element={<AdminSetupPage />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="produits" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="produits/nouveau" element={<AdminProductFormPage />} />
              <Route path="produits/:id/modifier" element={<AdminProductFormPage />} />
            </Route>
          </Route>
        </Routes>
      </ProductProvider>
    </BrowserRouter>
  )
}
