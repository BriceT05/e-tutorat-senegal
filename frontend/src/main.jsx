import './index.css'
import { StrictMode, useState, useEffect } from 'react'
import api from './api.js'
import { createRoot } from 'react-dom/client'
import HomePage from './HomePage.jsx'
import InscriptionPage from './InscriptionPage.jsx'
import ConnexionPage from './ConnexionPage.jsx'
import TuteursPage from './TuteursPage.jsx'
import ProfilTuteurPage from './ProfilTuteurPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import MatieresPage from './MatieresPage.jsx'
import BlogPage from './BlogPage.jsx'
import ResetPasswordPage from './ResetPasswordPage.jsx'
import VerifyEmailPage from './VerifyEmailPage.jsx'
import AdminPage from './AdminPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import LegalPage from './LegalPage.jsx'

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('etutorat_user') || 'null') } catch { return null }
}

const getResetToken = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('reset') || null
}

const getVerifyToken = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('verify') || null
}

function App() {
  // Pré-chauffe le backend Render dès le chargement de l'app
  useEffect(() => { api.get('/health').catch(() => {}) }, [])

  const [page, setPage] = useState('home')
  const [legalTab, setLegalTab] = useState('cgu')
  const [currentUser, setCurrentUser] = useState(getStoredUser)
  const [selectedTuteur, setSelectedTuteur] = useState(null)
  const [resetToken]  = useState(getResetToken)
  const [verifyToken] = useState(getVerifyToken)

  const nav = (p) => { setPage(p); window.scrollTo(0, 0) }

  const login = (token, user) => {
    localStorage.setItem('etutorat_token', token)
    localStorage.setItem('etutorat_user', JSON.stringify(user))
    setCurrentUser(user)
  }

  const logout = () => {
    localStorage.removeItem('etutorat_token')
    localStorage.removeItem('etutorat_user')
    setCurrentUser(null)
    nav('home')
  }

  const updateUser = (updatedUser) => {
    localStorage.setItem('etutorat_user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  if (verifyToken)
    return <VerifyEmailPage
      token={verifyToken}
      onGoHome={() => { window.history.replaceState({}, '', window.location.pathname); nav('home') }}
      onGoConnexion={() => { window.history.replaceState({}, '', window.location.pathname); nav('connexion') }}
    />

  if (resetToken)
    return <ResetPasswordPage
      token={resetToken}
      onGoHome={() => nav('home')}
      onGoConnexion={() => nav('connexion')}
    />

  if (page === 'inscription')
    return <InscriptionPage
      onGoHome={() => nav('home')}
      onSuccess={(token, user) => { login(token, user); nav('dashboard') }}
      onGoConnexion={() => nav('connexion')}
    />

  if (page === 'connexion')
    return <ConnexionPage
      onGoHome={() => nav('home')}
      onInscription={() => nav('inscription')}
      onSuccess={(token, user) => { login(token, user); nav('dashboard') }}
    />

  if (page === 'tuteurs')
    return <TuteursPage
      onGoHome={() => nav('home')}
      onViewTuteur={(t) => { setSelectedTuteur(t); nav('profil') }}
      currentUser={currentUser}
    />

  if (page === 'profil' && selectedTuteur)
    return <ProfilTuteurPage
      tuteurBase={selectedTuteur}
      onBack={() => nav('tuteurs')}
      onGoTuteurs={() => nav('tuteurs')}
      currentUser={currentUser}
      onNeedAuth={() => nav('connexion')}
    />

  if (page === 'dashboard') {
    if (currentUser?.role === 'ADMIN')
      return <AdminPage
        currentUser={currentUser}
        onGoHome={() => nav('home')}
        onLogout={logout}
      />
    return <DashboardPage
      currentUser={currentUser}
      onGoHome={() => nav('home')}
      onTuteurs={() => nav('tuteurs')}
      onLogout={logout}
      onUserUpdate={updateUser}
    />
  }

  if (page === 'legal')
    return <LegalPage
      tab={legalTab}
      onGoHome={() => nav('home')}
      onGoBack={() => nav('home')}
    />

  if (page === 'matieres')
    return <MatieresPage
      onGoHome={() => nav('home')}
      onTuteurs={() => nav('tuteurs')}
    />

  if (page === 'blog')
    return <BlogPage
      onGoHome={() => nav('home')}
      onTuteurs={() => nav('tuteurs')}
    />

  const knownPages = ['home', 'inscription', 'connexion', 'tuteurs', 'profil', 'dashboard', 'matieres', 'blog']
  if (!knownPages.includes(page))
    return <NotFoundPage
      onGoHome={() => nav('home')}
      onTuteurs={() => nav('tuteurs')}
    />

  return <HomePage
    onInscription={() => nav('inscription')}
    onConnexion={() => nav('connexion')}
    onTuteurs={() => nav('tuteurs')}
    onMatieres={() => nav('matieres')}
    onBlog={() => nav('blog')}
    onDashboard={() => { if (currentUser) nav('dashboard'); else nav('connexion') }}
    onLegal={(tab) => { setLegalTab(tab); nav('legal') }}
    currentUser={currentUser}
  />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
