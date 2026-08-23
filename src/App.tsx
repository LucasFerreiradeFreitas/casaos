import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { PrivateLayout } from './layouts/PrivateLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomeProvider } from './contexts/HomeContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { RecuperarSenha } from './pages/RecuperarSenha'
import { RedefinirSenha } from './pages/RedefinirSenha'
import { Dashboard } from './pages/Dashboard'
import { MinhaCasa } from './pages/MinhaCasa'
import { Bens } from './pages/Bens'
import { Garantias } from './pages/Garantias'
import { Manutencoes } from './pages/Manutencoes'
import { ItemDocuments } from './pages/ItemDocuments'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      </Route>

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <HomeProvider>
              <PrivateLayout />
            </HomeProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="minha-casa" element={<MinhaCasa />} />
        <Route path="bens" element={<Bens />} />
        <Route path="bens/:itemId" element={<ItemDocuments />} />
        <Route path="garantias" element={<Garantias />} />
        <Route path="manutencoes" element={<Manutencoes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
