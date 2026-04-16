import { Navigate, Route, Routes } from 'react-router-dom'
import ApplicationPage from '../pages/ApplicationPage.jsx'
import BeforeYouBeginPage from '../pages/BeforeYouBeginPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import SubmittedApplicationsPage from '../pages/SubmittedApplicationsPage.jsx'
import { usePersistentState } from '../hooks/usePersistentState.js'

const DEMO_EMAIL = 'demo@mucm.edu'
const DEMO_OTP = '123456'

function AppRouter() {
  const [authSession, setAuthSession] = usePersistentState('mucm-auth-session', {
    isAuthenticated: false,
    email: '',
  })

  function handleLogin(email, otp) {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedOtp = otp.trim()

    if (normalizedEmail === DEMO_EMAIL && normalizedOtp === DEMO_OTP) {
      setAuthSession({ isAuthenticated: true, email: normalizedEmail })
      return true
    }

    return false
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          authSession.isAuthenticated ? (
            <Navigate to="/before-you-begin" replace />
          ) : (
            <LoginPage
              onLogin={handleLogin}
              demoEmail={DEMO_EMAIL}
              demoOtp={DEMO_OTP}
            />
          )
        }
      />
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={handleLogin}
            demoEmail={DEMO_EMAIL}
            demoOtp={DEMO_OTP}
          />
        }
      />
      <Route
        path="/before-you-begin"
        element={
          authSession.isAuthenticated ? (
            <BeforeYouBeginPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/application"
        element={
          authSession.isAuthenticated ? (
            <ApplicationPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          authSession.isAuthenticated ? (
            <ProfilePage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          authSession.isAuthenticated ? (
            <SettingsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/submitted-applications"
        element={
          authSession.isAuthenticated ? (
            <SubmittedApplicationsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={authSession.isAuthenticated ? '/before-you-begin' : '/'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default AppRouter
