import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Auth from './pages/Auth'
import JobListing from './pages/JobListing'
import PostJob from './pages/PostJob'
import ApplyJob from './pages/ApplyJob'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Candidates from './pages/Candidates'
import ManageJobs from './pages/ManageJobs'
import ApplicationStatus from './pages/ApplicationStatus'
import AdminPanel from './pages/Admin'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'

// Protected Route Component
function ProtectedRoute({ children, roles }) {
  const { currentUser, userRole, loading } = useAuth()
  const [roleChecked, setRoleChecked] = useState(false)

  useEffect(() => {
    if (!loading && userRole) {
      setRoleChecked(true)
    }
  }, [loading, userRole])

  if (loading || !roleChecked) {
    return (
      <div className="min-h-screen pt-16 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!currentUser) {
    console.log('No user logged in, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(userRole)) {
    console.log(`User role ${userRole} not authorized for this route (required: ${roles.join(', ')})`)
    return <Navigate to="/" replace />
  }

  console.log(`Access granted for user role: ${userRole}`)
  return children
}

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col">
        <Header />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/jobs" element={<JobListing />} />
            <Route 
              path="/post-job" 
              element={
                <ProtectedRoute roles={['employer']}>
                  <PostJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/apply/:jobId" 
              element={
                <ProtectedRoute roles={['jobseeker']}>
                  <ApplyJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:chatId" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidates" 
              element={
                <ProtectedRoute roles={['employer']}>
                  <Candidates />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-jobs" 
              element={
                <ProtectedRoute roles={['employer']}>
                  <ManageJobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applications" 
              element={
                <ProtectedRoute roles={['jobseeker']}>
                  <ApplicationStatus />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminPanel />
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App