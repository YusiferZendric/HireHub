import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBuilding, FaMapMarkerAlt, FaClock, FaDollarSign } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function JobCard({ job }) {
  const { currentUser, userRole, loading } = useAuth()
  const navigate = useNavigate()

  const handleApply = (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('Please login to apply for jobs')
      navigate('/login')
      return
    }

    if (loading) {
      return
    }

    if (userRole !== 'jobseeker') {
      toast.error('Only job seekers can apply for jobs')
      return
    }

    navigate(`/apply/${job.id}`)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <img 
              src={job.companyLogo || '/default-company.png'} 
              alt={job.company}
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className={`px-4 py-1 rounded-full text-sm font-medium ${
            job.type === 'Full-time' ? 'bg-green-100 text-green-700' :
            job.type === 'Part-time' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {job.type || 'Full-time'}
          </span>
        </div>
         <h2 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h2>
       
       <div className="space-y-2 mb-4">
         <div className="flex items-center text-gray-600">
           <FaBuilding className="mr-2" />
           <span>{job.company}</span>
         </div>
         <div className="flex items-center text-gray-600">
           <FaMapMarkerAlt className="mr-2" />
           <span>{job.location}</span>
         </div>
         {job.salary && (
           <div className="flex items-center text-gray-600">
             <FaDollarSign className="mr-2" />
             <span>{job.salary}</span>
           </div>
         )}
         {job.posted && (
           <div className="flex items-center text-gray-600">
             <FaClock className="mr-2" />
             <span>Posted {job.posted}</span>
           </div>
         )}
       </div>
        <div className="flex flex-wrap gap-2 mb-4">
         {job.skills?.map((skill, index) => (
           <span 
             key={index}
             className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
           >
             {skill}
           </span>
         ))}
       </div>
        <button 
          onClick={handleApply}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Apply Now
        </button>
      </div>
    </motion.div>
  )
}

export default JobCard