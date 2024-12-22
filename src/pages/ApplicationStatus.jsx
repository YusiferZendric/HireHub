import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { FaBriefcase, FaBuilding, FaMoneyBillWave, FaClock, FaEnvelope } from 'react-icons/fa'
import toast from 'react-hot-toast'

function ApplicationStatus() {
  const { currentUser } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;
      
      try {
        // Get all applications for the current user
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('applicantId', '==', currentUser.uid)
        )
        const applicationsSnapshot = await getDocs(applicationsQuery)
        
        // Get job details for each application
        const applicationPromises = applicationsSnapshot.docs.map(async (appDoc) => {
          const appData = appDoc.data()
          const jobRef = doc(db, 'jobs', appData.jobId)
          
          try {
            const jobSnap = await getDoc(jobRef)
            const jobData = jobSnap.exists() ? jobSnap.data() : null
            
            return {
              id: appDoc.id,
              ...appData,
              job: jobData || {
                company: 'Unknown Company',
                type: 'Unknown Type'
              }
            }
          } catch (error) {
            console.error('Error fetching job data:', error)
            return {
              id: appDoc.id,
              ...appData,
              job: {
                company: 'Unknown Company',
                type: 'Unknown Type'
              }
            }
          }
        })

        const applicationsWithJobs = await Promise.all(applicationPromises)
        // Sort by most recent first
        const sortedApplications = applicationsWithJobs.sort((a, b) => {
          const dateA = a.appliedAt?.toDate?.() || new Date(0)
          const dateB = b.appliedAt?.toDate?.() || new Date(0)
          return dateB - dateA
        })
        
        setApplications(sortedApplications)
      } catch (error) {
        console.error('Error fetching applications:', error)
        toast.error('Failed to load applications')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [currentUser])

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-900 text-green-200'
      case 'rejected':
        return 'bg-red-900 text-red-200'
      default:
        return 'bg-yellow-900 text-yellow-200'
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString()
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString()
      }
      if (typeof timestamp === 'number') {
        return new Date(timestamp * 1000).toLocaleString()
      }
      return new Date(timestamp).toLocaleString()
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Your Applications</h1>

        <div className="space-y-6">
          {applications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {application.jobTitle}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-400">
                      <FaBuilding className="mr-2" />
                      <span>{application.job.company}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <FaBriefcase className="mr-2" />
                      <span>{application.job.type}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <FaMoneyBillWave className="mr-2" />
                      <span>Expected: ${application.expectedSalary?.toLocaleString()}/year</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <FaClock className="mr-2" />
                      <span>Applied: {formatDate(application.appliedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-4 py-2 rounded-full ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </div>

              {application.messages && application.messages.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Messages</h3>
                  <div className="space-y-3">
                    {application.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg ${
                          msg.from === 'employer' ? 'bg-blue-900 ml-4' : 'bg-gray-700 mr-4'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          <span className="text-gray-300">
                            {msg.from === 'employer' ? 'Employer' : 'You'}
                          </span>
                        </div>
                        <p className="text-gray-200">{msg.message}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {formatDate(msg.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Your Application</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Cover Letter</h4>
                    <p className="text-gray-400 whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Experience</h4>
                    <p className="text-gray-400 whitespace-pre-wrap">{application.experience}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {applications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">You haven't applied to any jobs yet</p>
              <a
                href="/jobs"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationStatus
