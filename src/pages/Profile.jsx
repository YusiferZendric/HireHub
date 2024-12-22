import { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import ProfileCard from '../components/ProfileCard'

function Profile() {
  const [profiles, setProfiles] = useState([])
  const [filters, setFilters] = useState({
    country: '',
    incomeRange: '',
    experience: '',
    language: '',
    skills: ''
  })
  const [userData, setUserData] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [latestApplication, setLatestApplication] = useState(null)
  const [formData, setFormData] = useState({
    experience: '',
    portfolio: '',
    resume: '',
    skills: ''
  })

  useEffect(() => {
    const fetchProfiles = async () => {
      let q = collection(db, 'profiles')
      
      // Apply filters
      if (filters.experience) {
        q = query(q, where('experience', '>=', parseInt(filters.experience)))
      }
      // Add more filters as needed

      const querySnapshot = await getDocs(q)
      const profileList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setProfiles(profileList)
    }

    fetchProfiles()
  }, [filters])

  useEffect(() => {
    const fetchLatestApplication = async () => {
      if (!userData) return
      
      try {
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('applicantId', '==', userData.uid),
          orderBy('appliedAt', 'desc'),
          limit(1)
        )
        const snapshot = await getDocs(applicationsQuery)
        
        if (!snapshot.empty) {
          setLatestApplication(snapshot.docs[0].data())
        }
      } catch (error) {
        console.error('Error fetching latest application:', error)
      }
    }

    fetchLatestApplication()
  }, [userData])

  useEffect(() => {
    if (latestApplication) {
      setFormData(prev => ({
        ...prev,
        experience: latestApplication.experience || prev.experience,
        portfolio: latestApplication.portfolio || prev.portfolio,
        resume: latestApplication.resume || prev.resume,
        skills: latestApplication.skills?.join(', ') || prev.skills
      }))
    }
  }, [latestApplication])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Job Seeker Profiles</h1>
      <div className="mb-6">
        <h2 className="text-2xl mb-4">Filters</h2>
        <div className="space-x-4">
          <input 
            type="text" 
            name="country" 
            placeholder="Country" 
            value={filters.country} 
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <input 
            type="number" 
            name="experience" 
            placeholder="Minimum Experience (years)" 
            value={filters.experience} 
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          {/* Add more filter inputs as needed */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Apply Filters</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
      {/* Applications History Section */}
      {userRole === 'jobseeker' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Application History</h2>
          <div className="space-y-4">
            {userData?.applications?.map((application, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {application.jobTitle}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-400">
                        <span className="mr-2">Company:</span>
                        <span>{application.company}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <span className="mr-2">Expected Salary:</span>
                        <span>${application.expectedSalary?.toLocaleString()}/year</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <span className="mr-2">Applied:</span>
                        <span>{application.appliedAt}</span>
                      </div>
                      {application.acceptedAt && (
                        <div className="flex items-center text-green-400">
                          <span className="mr-2">Accepted:</span>
                          <span>{application.acceptedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      application.status === 'accepted'
                        ? 'bg-green-900 text-green-200'
                        : application.status === 'rejected'
                        ? 'bg-red-900 text-red-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
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

                <div className="mt-4 flex flex-wrap gap-4">
                  {application.portfolio && (
                    <a
                      href={application.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300"
                    >
                      <span className="mr-2">Portfolio</span>
                    </a>
                  )}
                  {application.resume && (
                    <a
                      href={application.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300"
                    >
                      <span className="mr-2">Resume</span>
                    </a>
                  )}
                </div>
              </div>
            ))}

            {(!userData?.applications || userData.applications.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-400">No applications yet</p>
                <button
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile