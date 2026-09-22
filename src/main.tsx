import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import '@fontsource-variable/heebo/wght.css'
import '@fontsource/varela-round/hebrew-400.css'
import '@fontsource/varela-round/latin-400.css'
import './index.css'
import { SiteLayout } from './components/layout/SiteLayout'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import NotFound from './pages/NotFound'
import { BASE } from './lib/base'

const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      // department + collection templates (one PLP component, keyed by route)
      ...['women', 'men', 'girls', 'boys', 'kids', 'sale', 'new', 'brands'].map((k) => ({ path: `/${k}`, element: <CategoryPage kind={k} key={k} /> })),
      { path: '/category/:slug', element: <CategoryPage kind="category" /> },
      { path: '/brand/:slug', element: <CategoryPage kind="brand" /> },
      { path: '/product/:slug', element: <ProductPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], { basename: BASE || undefined })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
