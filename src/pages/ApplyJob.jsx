import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { FaBriefcase, FaMoneyBillWave, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import toast from 'react-hot-toast'

function ApplyJob() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    coverLetter: '',
    experience: '',
    portfolio: '',
    resume: '',
    expectedSalary: ''
  })

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId))
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() })
        } else {
          toast.error('Job not found')
          navigate('/jobs')
        }
      } catch (error) {
        console.error('Error fetching job:', error)
        toast.error('Failed to load job details')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Create application document
      const applicationData = {
        jobId,
        jobTitle: job.title,
        applicantId: currentUser.uid,
        applicantName: `${formData.firstName} ${formData.lastName}`,
        applicantEmail: currentUser.email,
        applicantPhone: formData.phone,
        ...formData,
        status: 'pending',
        messages: [],
        appliedAt: serverTimestamp()
      }

      const applicationRef = await addDoc(collection(db, 'applications'), applicationData)

      // Update job document with application reference
      await updateDoc(doc(db, 'jobs', jobId), {
        applications: arrayUnion(applicationRef.id)
      })

      // Create notification for employer
      await addDoc(collection(db, 'notifications'), {
        recipientId: job.postedBy,
        type: 'new_application',
        jobId,
        jobTitle: job.title,
        applicantId: currentUser.uid,
        applicantName: `${formData.firstName} ${formData.lastName}`,
        applicationId: applicationRef.id,
        status: 'unread',
        createdAt: serverTimestamp()
      })

      toast.success('Application submitted successfully!')
      navigate('/applications')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-16 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Job Not Found</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700"
        >
          {/* Job Details */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">{job.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-400">
                <FaBriefcase className="mr-2" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <FaMapMarkerAlt className="mr-2" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <FaMoneyBillWave className="mr-2" />
                <span>${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <FaClock className="mr-2" />
                <span>{job.type}</span>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-300 mb-1">
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                required
                rows={6}
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Tell us why you're the perfect fit for this role..."
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-1">
                Relevant Experience
              </label>
              <textarea
                id="experience"
                name="experience"
                required
                rows={4}
                value={formData.experience}
                onChange={handleChange}
                placeholder="Describe your relevant experience..."
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium text-gray-300 mb-1">
                Portfolio URL (Optional)
              </label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://your-portfolio.com"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-300 mb-1">
                Resume/CV URL
              </label>
              <input
                type="url"
                id="resume"
                name="resume"
                required
                value={formData.resume}
                onChange={handleChange}
                placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-300 mb-1">
                Expected Salary (USD)
              </label>
              <input
                type="number"
                id="expectedSalary"
                name="expectedSalary"
                required
                value={formData.expectedSalary}
                onChange={handleChange}
                placeholder="Enter your expected annual salary"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ApplyJob