import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, serverTimestamp, addDoc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { FaBriefcase, FaMoneyBillWave, FaMapMarkerAlt, FaClock, FaUser, FaEnvelope, FaPhoneAlt, FaCheck, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'

const formatMessageDate = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    // Handle JavaScript Date
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    // Handle timestamp as seconds or milliseconds
    if (typeof timestamp === 'number') {
      return new Date(timestamp * 1000).toLocaleString();
    }
    // Handle timestamp as object with seconds
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

function ManageJobs() {
  const { currentUser } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [showResponseModal, setShowResponseModal] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(
          collection(db, 'jobs'),
          where('postedBy', '==', currentUser.uid)
        )
        const querySnapshot = await getDocs(q)
        const jobList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setJobs(jobList)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        toast.error('Failed to load your jobs')
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchJobs()
    }
  }, [currentUser])

  const fetchApplications = async (jobId) => {
    setLoadingApplications(true)
    try {
      const q = query(
        collection(db, 'applications'),
        where('jobId', '==', jobId)
      )
      const querySnapshot = await getDocs(q)
      const applicationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setApplications(applicationsList)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleJobSelect = (job) => {
    setSelectedJob(job)
    fetchApplications(job.id)
  }

  const handleApplicationStatus = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        updatedAt: new Date()
      })

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      )

      toast.success(`Application ${newStatus}`)
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application status')
    }
  }

  const handleResponse = async (applicationId, status, message) => {
    try {
      // Get the application document first
      const applicationRef = doc(db, 'applications', applicationId)
      const applicationSnap = await getDoc(applicationRef)
      
      if (!applicationSnap.exists()) {
        throw new Error('Application not found')
      }

      const currentMessages = applicationSnap.data().messages || []
      const now = Timestamp.now()

      // Prepare the update data
      const updateData = {
        status: status,
        messages: [...currentMessages, {
          from: 'employer',
          message: message,
          timestamp: now
        }],
        updatedAt: serverTimestamp()
      }

      // Update application
      await updateDoc(applicationRef, updateData)

      // Create notification for applicant
      const application = applications.find(app => app.id === applicationId)
      const jobRef = doc(db, 'jobs', selectedJob.id)
      const jobSnap = await getDoc(jobRef)
      const jobData = jobSnap.data()

      // Create detailed notification
      await addDoc(collection(db, 'notifications'), {
        recipientId: application.applicantId,
        type: 'application_update',
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyName: jobData.company,
        applicationId: applicationId,
        status: status,
        message: message,
        employerName: jobData.postedByName || 'Employer',
        createdAt: serverTimestamp(),
        read: false,
        notificationType: status === 'accepted' ? 'success' : 'info'
      })

      // If accepted, update user's profile with application info
      if (status === 'accepted') {
        const userRef = doc(db, 'users', application.applicantId)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const applications = userSnap.data().applications || []
          const applicationData = {
            jobId: selectedJob.id,
            jobTitle: selectedJob.title,
            company: jobData.company,
            appliedAt: application.appliedAt || now,
            acceptedAt: now,
            status: 'accepted',
            coverLetter: application.coverLetter,
            experience: application.experience,
            portfolio: application.portfolio,
            resume: application.resume,
            expectedSalary: application.expectedSalary,
            responseMessage: message
          }

          // Update user document with new application
          await updateDoc(userRef, {
            applications: [...applications, applicationData]
          })
        }
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                status: status,
                messages: [...(app.messages || []), {
                  from: 'employer',
                  message: message,
                  timestamp: now.toDate()
                }]
              }
            : app
        )
      )

      setShowResponseModal(false)
      setResponseMessage('')
      toast.success(`Application ${status} successfully`)
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application: ' + error.message)
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Jobs List */}
          <div className="w-full md:w-1/3">
            <h2 className="text-2xl font-bold text-white mb-6">Your Job Listings</h2>
            <div className="space-y-4">
              {jobs.map(job => (
                <motion.div
                  key={job.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedJob?.id === job.id
                      ? 'bg-gray-700 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handleJobSelect(job)}
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{job.title}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-400 text-sm">
                      <FaBriefcase className="mr-2" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <FaClock className="mr-2" />
                      <span>{job.type}</span>
                    </div>
                  </div>
                  {job.applications?.length > 0 && (
                    <div className="mt-2 text-sm text-blue-400">
                      {job.applications.length} application(s)
                    </div>
                  )}
                </motion.div>
              ))}

              {jobs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You haven't posted any jobs yet</p>
                  <Link
                    to="/post-job"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Applications List */}
          <div className="w-full md:w-2/3">
            {selectedJob ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Applications for {selectedJob.title}
                </h2>
                {loadingApplications ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map(application => (
                      <motion.div
                        key={application.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {application.applicantName}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-400">
                                <FaEnvelope className="mr-2" />
                                <span>{application.applicantEmail}</span>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <FaPhoneAlt className="mr-2" />
                                <span>{application.applicantPhone}</span>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <FaMoneyBillWave className="mr-2" />
                                <span>Expected: ${application.expectedSalary?.toLocaleString()}/year</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {application.status === 'pending' ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedApplication(application)
                                    setShowResponseModal(true)
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                  <FaEnvelope className="mr-2" />
                                  Reply
                                </button>
                                <button
                                  onClick={() => handleResponse(application.id, 'accepted', 'Your application has been accepted! We will contact you shortly with next steps.')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                >
                                  <FaCheck className="mr-2" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleResponse(application.id, 'rejected', 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.')}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                >
                                  <FaTimes className="mr-2" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  application.status === 'accepted'
                                    ? 'bg-green-900 text-green-200'
                                    : 'bg-red-900 text-red-200'
                                }`}>
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedApplication(application)
                                    setShowResponseModal(true)
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                  <FaEnvelope className="mr-2" />
                                  Reply
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-lg font-medium text-white mb-2">Cover Letter</h4>
                          <p className="text-gray-400 whitespace-pre-wrap">{application.coverLetter}</p>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-lg font-medium text-white mb-2">Experience</h4>
                          <p className="text-gray-400 whitespace-pre-wrap">{application.experience}</p>
                        </div>

                        {application.messages && application.messages.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-lg font-medium text-white mb-2">Messages</h4>
                            <div className="space-y-2">
                              {application.messages.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-lg ${
                                    msg.from === 'employer'
                                      ? 'bg-blue-900 ml-4'
                                      : 'bg-gray-700 mr-4'
                                  }`}
                                >
                                  <p className="text-gray-200">{msg.message}</p>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {formatMessageDate(msg.timestamp)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-4">
                          {application.portfolio && (
                            <a
                              href={application.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-400 hover:text-blue-300"
                            >
                              <FaUser className="mr-2" />
                              Portfolio
                            </a>
                          )}
                          {application.resume && (
                            <a
                              href={application.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-400 hover:text-blue-300"
                            >
                              <FaBriefcase className="mr-2" />
                              Resume
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {applications.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-400">No applications received yet</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Select a job to view applications</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Respond to {selectedApplication.applicantName}'s Application
            </h3>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Enter your response message..."
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowResponseModal(false)
                  setResponseMessage('')
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResponse(selectedApplication.id, 'accepted', responseMessage)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Accept & Send
              </button>
              <button
                onClick={() => handleResponse(selectedApplication.id, 'rejected', responseMessage)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageJobs
