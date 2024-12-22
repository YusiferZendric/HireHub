import { motion } from 'framer-motion'
import { FaBriefcase, FaMapMarkerAlt, FaGraduationCap, FaLanguage } from 'react-icons/fa'
import { BsLightningChargeFill } from 'react-icons/bs'
function ProfileCard({ profile }) {
 return (
   <motion.div
     whileHover={{ y: -5 }}
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
   >
     <div className="p-6">
       <div className="flex items-center space-x-4 mb-4">
         <div className="relative">
           <img
             src={profile.avatar || '/default-avatar.png'}
             alt={profile.name}
             className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
           />
           {profile.isAvailable && (
             <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
           )}
         </div>
         <div>
           <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
           <p className="text-blue-600 font-medium">{profile.title}</p>
         </div>
       </div>
        <div className="space-y-3 mb-4">
         <div className="flex items-center text-gray-600">
           <FaBriefcase className="mr-2" />
           <span>{profile.experience} years experience</span>
         </div>
         <div className="flex items-center text-gray-600">
           <FaMapMarkerAlt className="mr-2" />
           <span>{profile.location}</span>
         </div>
         {profile.education && (
           <div className="flex items-center text-gray-600">
             <FaGraduationCap className="mr-2" />
             <span>{profile.education}</span>
           </div>
         )}
         {profile.languages && (
           <div className="flex items-center text-gray-600">
             <FaLanguage className="mr-2" />
             <span>{profile.languages.join(', ')}</span>
           </div>
         )}
       </div>
        <div className="mb-4">
         <div className="flex items-center mb-2">
           <BsLightningChargeFill className="text-blue-600 mr-2" />
           <span className="font-semibold text-gray-700">Skills</span>
         </div>
         <div className="flex flex-wrap gap-2">
           {profile.skills.map((skill, index) => (
             <span
               key={index}
               className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
             >
               {skill}
             </span>
           ))}
         </div>
       </div>
        <motion.button
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
       >
         View Profile
       </motion.button>
     </div>
   </motion.div>
 )
}
export default ProfileCard