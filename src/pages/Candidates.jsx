import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaGithub, FaLinkedin, FaGlobe, FaComments } from 'react-icons/fa'
import generateFakeCandidates from '../utils/generateFakeCandidates'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true)
      try {
        const candidatesRef = collection(db, 'candidates')
        const q = query(candidatesRef, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) {
          console.log('No candidates found, generating some...')
          const generatedCandidates = await generateFakeCandidates(50)
          setCandidates(generatedCandidates)
        } else {
          const candidatesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setCandidates(candidatesList)
        }
      } catch (error) {
        console.error('Error fetching candidates:', error)
        toast.error('Failed to load candidates')
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchTerm || 
      candidate.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.technical.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesLocation = !filterLocation ||
      candidate.personalInfo.location.toLowerCase().includes(filterLocation.toLowerCase())
    
    return matchesSearch && matchesLocation
  })

  const startChat = async (candidate) => {
    try {
      // Create a new chat document
      const chatsRef = collection(db, 'chats')
      const chatDoc = await addDoc(chatsRef, {
        participants: [currentUser.uid, candidate.uid],
        participantInfo: {
          [currentUser.uid]: {
            name: currentUser.displayName || 'Employer',
            role: 'employer'
          },
          [candidate.uid]: {
            name: `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`,
            role: 'candidate'
          }
        },
        lastMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Navigate to the chat page
      navigate(`/chat/${chatDoc.id}`)
    } catch (error) {
      console.error('Error starting chat:', error)
      toast.error('Failed to start chat. Please try again.')
    }
  }

  const CandidateCard = ({ candidate }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer relative group"
      onClick={() => setSelectedCandidate(candidate)}
    >
      <div className="flex items-start space-x-4">
        <img
          src={candidate.personalInfo.profilePicture}
          alt={`${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`}
          className="w-20 h-20 rounded-full bg-gray-700"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">
            {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
          </h3>
          <p className="text-gray-400 mt-1">
            {candidate.workExperience[0]?.role || 'Fresh Graduate'} {candidate.workExperience[0]?.company ? `at ${candidate.workExperience[0].company}` : ''}
          </p>
          <div className="flex items-center text-gray-400 mt-2">
            <FaMapMarkerAlt className="mr-2" />
            <span>{candidate.personalInfo.location}</span>
          </div>
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {candidate.skills.technical.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm bg-gray-700 text-gray-300 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.technical.length > 4 && (
                <span className="px-2 py-1 text-sm bg-gray-700 text-gray-300 rounded-full">
                  +{candidate.skills.technical.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Chat Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          startChat(candidate)
        }}
        className="absolute top-4 right-4 p-2 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        <FaComments className="w-5 h-5" />
      </button>
    </motion.div>
  )

  const CandidateModal = ({ candidate, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={candidate.personalInfo.profilePicture}
              alt={`${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`}
              className="w-24 h-24 rounded-full bg-gray-700"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
              </h2>
              <p className="text-gray-400">
                {candidate.workExperience[0]?.role || 'Fresh Graduate'}
              </p>
              <div className="flex items-center text-gray-400 mt-2">
                <FaMapMarkerAlt className="mr-2" />
                <span>{candidate.personalInfo.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                startChat(candidate)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaComments className="w-5 h-5" />
              <span>Chat</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-semibold"
            >
              ×
            </button>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">About</h3>
          <p className="text-gray-400">{candidate.personalInfo.about}</p>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Contact Information</h3>
          <div className="space-y-2 text-gray-400">
            <p>Email: {candidate.personalInfo.email}</p>
            <p>Phone: {candidate.personalInfo.phone}</p>
            <div className="flex space-x-4 mt-2">
              <a
                href={candidate.personalInfo.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center"
              >
                <FaLinkedin className="mr-2" /> LinkedIn
              </a>
              <a
                href={candidate.personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center"
              >
                <FaGithub className="mr-2" /> GitHub
              </a>
              <a
                href={candidate.personalInfo.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center"
              >
                <FaGlobe className="mr-2" /> Portfolio
              </a>
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Work Experience</h3>
          <div className="space-y-4">
            {candidate.workExperience.map((exp, index) => (
              <div key={index} className="border-l-2 border-gray-700 pl-4">
                <div className="flex items-center text-gray-300">
                  <FaBriefcase className="mr-2" />
                  <h4 className="font-semibold">{exp.role}</h4>
                </div>
                <p className="text-gray-400">{exp.company}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(exp.startDate).getFullYear()} - {
                    exp.endDate === 'Present' ? 'Present' : new Date(exp.endDate).getFullYear()
                  }
                </p>
                <ul className="mt-2 space-y-1 text-gray-400">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx}>• {resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Education</h3>
          <div className="border-l-2 border-gray-700 pl-4">
            <div className="flex items-center text-gray-300">
              <FaGraduationCap className="mr-2" />
              <h4 className="font-semibold">{candidate.education.degree}</h4>
            </div>
            <p className="text-gray-400">{candidate.education.university}</p>
            <p className="text-gray-500 text-sm">
              {candidate.education.startYear} - {candidate.education.endYear}
            </p>
            <p className="text-gray-400">GPA: {candidate.education.gpa}</p>
            <ul className="mt-2 space-y-1 text-gray-400">
              {candidate.education.achievements.map((achievement, idx) => (
                <li key={idx}>• {achievement}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Skills</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-gray-300 mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.technical.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-gray-300 mb-2">Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.soft.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Languages</h3>
          <div className="flex flex-wrap gap-4">
            {candidate.languages.map((lang, index) => (
              <div key={index} className="text-gray-400">
                <span className="font-medium">{lang.name}</span>
                <span className="text-gray-500 ml-2">({lang.level})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Projects</h3>
          <div className="space-y-4">
            {candidate.projects.map((project, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-gray-200 font-semibold">{project.name}</h4>
                <p className="text-gray-400 mt-1">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-600 text-gray-300 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
                >
                  View Project →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Certifications</h3>
          <div className="space-y-2">
            {candidate.certifications.map((cert, index) => (
              <div key={index} className="text-gray-400">
                <span className="font-medium">{cert.name}</span>
                <span className="text-gray-500 ml-2">
                  by {cert.issuer} ({cert.year})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Preferences */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Job Preferences</h3>
          <div className="space-y-2 text-gray-400">
            <p>Looking for: {candidate.preferences.jobTypes.join(', ')}</p>
            <p>Expected Salary: ₹{(candidate.preferences.expectedSalary.min / 100000).toFixed(1)}L - ₹{(candidate.preferences.expectedSalary.max / 100000).toFixed(1)}L</p>
            <p>Preferred Locations: {candidate.preferences.preferredLocations.join(', ')}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Browse Candidates</h1>
          <p className="text-xl text-gray-400">Find the perfect candidate for your team</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or skills..."
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by location..."
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCandidates.map(candidate => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No candidates found matching your criteria</p>
          </div>
        )}

        {/* Candidate Modal */}
        {selectedCandidate && (
          <CandidateModal
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </div>
    </div>
  )
}

export default Candidates
