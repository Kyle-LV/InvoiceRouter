import { BrowserRouter, Routes, Route } from 'react-router-dom'
import InvoiceRouterPage from './pages/InvoiceRouterPage'
import InvoiceRegisterPage from './pages/InvoiceRegisterPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvoiceRouterPage />} />
        <Route path="/register" element={<InvoiceRegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}