import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaBell } from 'react-icons/fa'
import { generateAndUploadFakeJobs } from '../utils/fakeJobsGenerator'
import toast from 'react-hot-toast'

function Header() {
  const navigate = useNavigate()
  const { currentUser, userRole, logout } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleGenerateJobs = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      toast.loading('Generating 200 job listings...')
      await generateAndUploadFakeJobs('system', 'System Generated', 200)
      toast.success('Successfully generated 200 job listings!')
      // Refresh the page to show new jobs
      window.location.reload()
    } catch (error) {
      console.error('Error generating jobs:', error)
      toast.error('Failed to generate jobs')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            HireHub
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/jobs" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Browse Jobs
            </Link>

            {currentUser && (
              <>
                {userRole === 'employer' ? (
                  <>
                    <Link 
                      to="/post-job" 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Post Job
                    </Link>
                    <Link 
                      to="/manage-jobs" 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Manage Jobs
                    </Link>
                    <Link 
                      to="/candidates" 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Browse Candidates
                    </Link>
                    <button
                      onClick={handleGenerateJobs}
                      disabled={isGenerating}
                      className={`px-4 py-2 ${
                        isGenerating 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white rounded-lg transition-colors`}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Jobs'}
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/applications" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Applications
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-gray-300 hover:text-white p-2"
                  >
                    <FaBell className="w-6 h-6" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg py-2">
                      {notifications.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No new notifications</p>
                      ) : (
                        notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                          >
                            <p className="text-white font-medium">{notification.title}</p>
                            <p className="text-gray-400 text-sm">{notification.message}</p>
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => handleNotificationAction(notification.id, 'accept')}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleNotificationAction(notification.id, 'reject')}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <Link 
                  to="/profile" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header