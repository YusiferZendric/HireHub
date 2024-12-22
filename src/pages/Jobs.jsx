import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import generateFakeJobs from '../utils/generateFakeJobs'
import toast from 'react-hot-toast'

function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true)
      try {
        console.log('Attempting to fetch jobs from Firebase...')
        // Create a query that orders by postedAt
        const jobsQuery = query(
          collection(db, 'jobs'),
          orderBy('postedAt', 'desc')
        )
        
        const snapshot = await getDocs(jobsQuery)
        console.log('Snapshot:', {
          empty: snapshot.empty,
          size: snapshot.size,
          docs: snapshot.docs.length
        })
        
        if (snapshot.empty) {
          console.log('No jobs found in Firebase, generating new ones...')
          toast.loading('Generating jobs...', { id: 'generating' })
          
          try {
            const generatedJobs = await generateFakeJobs(200)
            console.log('Generated jobs:', generatedJobs.length)
            setJobs(generatedJobs)
            toast.success(`Generated ${generatedJobs.length} jobs!`, { id: 'generating' })
          } catch (error) {
            console.error('Error generating jobs:', error)
            toast.error('Failed to generate jobs', { id: 'generating' })
          }
        } else {
          const jobsList = snapshot.docs.map(doc => {
            const data = doc.data()
            // Convert Firestore Timestamp to Date for display
            if (data.postedAt) {
              data.postedAt = data.postedAt.toDate()
            }
            console.log('Job data:', { id: doc.id, ...data })
            return { id: doc.id, ...data }
          })
          console.log(`Loaded ${jobsList.length} existing jobs from Firebase`)
          setJobs(jobsList)
        }
      } catch (error) {
        console.error('Error loading jobs:', error)
        toast.error('Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  // Filter and sort functions
  const filterJobs = (jobs) => {
    return jobs.filter(job => {
      const matchesSearch = 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false

      const matchesType = filterType === 'all' || job.type === filterType
      
      return matchesSearch && matchesType
    })
  }

  const sortJobs = (jobs) => {
    return [...jobs].sort((a, b) => {
      switch (sortBy) {
        case 'salary':
          return (b.maxSalary || 0) - (a.maxSalary || 0)
        case 'applicants':
          return (b.applicants?.length || 0) - (a.applicants?.length || 0)
        case 'recent':
        default:
          // Handle both Date objects and Timestamps
          const dateA = a.postedAt instanceof Date ? a.postedAt : a.postedAt?.toDate()
          const dateB = b.postedAt instanceof Date ? b.postedAt : b.postedAt?.toDate()
          return dateB - dateA
      }
    })
  }

  const displayJobs = sortJobs(filterJobs(jobs))

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Browse Jobs</h1>
            <p className="text-xl text-gray-400">Find your next opportunity</p>
            <p className="text-gray-400 mt-2">Total Jobs: {jobs.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
          <input
            type="text"
            placeholder="Search jobs..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="salary">Highest Salary</option>
            <option value="applicants">Most Applied</option>
          </select>

          <select
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {displayJobs.map(job => (
              <div
                key={job.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{job.title}</h2>
                    <div className="space-y-2">
                      <p className="text-gray-400">{job.company}</p>
                      <p className="text-gray-400">{job.location}</p>
                      <p className="text-gray-400">${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}/year</p>
                      <p className="text-gray-400">{job.type}</p>
                      <p className="text-gray-400">Posted: {job.postedAt?.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.map((skill, index) => (
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
                    {job.benefits?.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {displayJobs.length === 0 && !loading && (
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

export default Jobs
