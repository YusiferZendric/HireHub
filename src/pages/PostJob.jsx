import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { FaBriefcase, FaMoneyBillWave, FaUsers, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import toast from 'react-hot-toast'

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive']

function PostJob() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    experience: 'Entry Level',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    benefits: '',
    skills: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()),
        benefits: formData.benefits.split(',').map(benefit => benefit.trim()),
        postedBy: currentUser.uid,
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        status: 'active',
        applications: []
      }

      await addDoc(collection(db, 'jobs'), jobData)
      toast.success('Job posted successfully!')
      navigate('/jobs')
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error('Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1"

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Post a New Job</h2>
            <p className="mt-2 text-gray-400">Fill in the details to create a new job listing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="title" className={labelClasses}>Job Title</label>
              <div className="relative">
                <FaBriefcase className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior React Developer"
                  className={`${inputClasses} pl-10`}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="company" className={labelClasses}>Company Name</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Tech Solutions Inc."
                  className={inputClasses}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="location" className={labelClasses}>Location</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. New York, NY (or Remote)"
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="type" className={labelClasses}>Job Type</label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-3 text-gray-400" />
                  <select
                    id="type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className={`${inputClasses} pl-10`}
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type} className="bg-gray-800">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="experience" className={labelClasses}>Experience Level</label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-3 text-gray-400" />
                  <select
                    id="experience"
                    name="experience"
                    required
                    value={formData.experience}
                    onChange={handleChange}
                    className={`${inputClasses} pl-10`}
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level} className="bg-gray-800">
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="salaryMin" className={labelClasses}>Minimum Salary</label>
                <div className="relative">
                  <FaMoneyBillWave className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="number"
                    id="salaryMin"
                    name="salaryMin"
                    required
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <label htmlFor="salaryMax" className={labelClasses}>Maximum Salary</label>
                <div className="relative">
                  <FaMoneyBillWave className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="number"
                    id="salaryMax"
                    name="salaryMax"
                    required
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="e.g. 80000"
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <label htmlFor="description" className={labelClasses}>Job Description</label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and ideal candidate..."
                rows="4"
                className={inputClasses}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <label htmlFor="requirements" className={labelClasses}>Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                required
                value={formData.requirements}
                onChange={handleChange}
                placeholder="List the key requirements and qualifications..."
                rows="4"
                className={inputClasses}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <label htmlFor="benefits" className={labelClasses}>Benefits</label>
              <textarea
                id="benefits"
                name="benefits"
                required
                value={formData.benefits}
                onChange={handleChange}
                placeholder="List the benefits and perks..."
                rows="4"
                className={inputClasses}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <label htmlFor="skills" className={labelClasses}>Required Skills</label>
              <input
                type="text"
                id="skills"
                name="skills"
                required
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, TypeScript (comma-separated)"
                className={inputClasses}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="flex justify-end"
            >
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Job...
                  </span>
                ) : (
                  'Post Job'
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default PostJob