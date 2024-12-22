import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaBriefcase, FaMoneyBillWave, FaMapMarkerAlt, FaClock, FaSearch, FaFilter } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

function JobListing() {
  const { currentUser } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    experience: '',
    salaryMin: '',
    salaryMax: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log('Fetching jobs...')
        const jobsRef = collection(db, 'jobs')
        // Query all jobs, ordered by postedAt or createdAt
        const q = query(jobsRef)
        
        console.log('Executing query...')
        const querySnapshot = await getDocs(q)
        
        console.log('Processing results...')
        const jobList = querySnapshot.docs.map(doc => {
          const data = doc.data()
          console.log('Job data:', { id: doc.id, ...data })
          return {
            id: doc.id,
            ...data,
            // Use postedAt if available, otherwise use createdAt
            postedAt: data.postedAt?.toDate() || data.createdAt?.toDate()
          }
        })
        
        // Sort jobs by postedAt date
        jobList.sort((a, b) => (b.postedAt || 0) - (a.postedAt || 0))
        
        console.log('Total jobs found:', jobList.length)
        setJobs(jobList)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setError(error.message)
        toast.error(`Failed to load jobs: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !filters.search || 
      job.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company?.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesLocation = !filters.location || 
      job.location?.toLowerCase().includes(filters.location.toLowerCase())
    
    const matchesType = !filters.type || job.type === filters.type
    
    const matchesExperience = !filters.experience || job.experience === filters.experience
    
    const matchesSalary = (!filters.salaryMin || job.minSalary >= parseInt(filters.salaryMin)) &&
      (!filters.salaryMax || job.maxSalary <= parseInt(filters.salaryMax))

    return matchesSearch && matchesLocation && matchesType && matchesExperience && matchesSalary
  })

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified'
    if (!max) return `$${min.toLocaleString()}+`
    if (!min) return `Up to $${max.toLocaleString()}`
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  const formatDate = (date) => {
    if (!date) return ''
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Posted yesterday'
    if (diffDays < 7) return `Posted ${diffDays} days ago`
    return `Posted on ${date.toLocaleDateString()}`
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Browse Jobs</h1>
          <p className="text-xl text-gray-400">Find your next opportunity</p>
          <p className="text-gray-400 mt-2">Total Jobs Available: {jobs.length}</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <FaFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <input
                type="text"
                placeholder="Location"
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
              <select
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
              <select
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              >
                <option value="">All Experience Levels</option>
                <option value="Entry Level">Entry Level</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="7+ years">7+ years</option>
              </select>
            </motion.div>
          )}
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map(job => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{job.title}</h2>
                    <div className="space-y-2">
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
                        <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <FaClock className="mr-2" />
                        <span>{formatDate(job.postedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/apply/${job.id}`}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(job.skills) && job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Benefits</h3>
                  <ul className="list-disc list-inside text-gray-400">
                    {Array.isArray(job.benefits) && job.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobListing