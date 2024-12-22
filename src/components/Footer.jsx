import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
function Footer() {
 return (
   <footer className="bg-gray-900 text-white">
     <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Company Info */}
         <div className="space-y-4">
           <h3 className="text-2xl font-bold">HireHub</h3>
           <p className="text-gray-400">
             Connecting talent with opportunity. Your next career move starts here.
           </p>
         </div>
          {/* Quick Links */}
         <div className="space-y-4">
           <h4 className="text-xl font-semibold">Quick Links</h4>
           <ul className="space-y-2">
             <li>
               <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                 About Us
               </a>
             </li>
             <li>
               <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                 Contact
               </a>
             </li>
             <li>
               <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                 Privacy Policy
               </a>
             </li>
             <li>
               <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                 Terms of Service
               </a>
             </li>
           </ul>
         </div>
          {/* Contact & Social */}
         <div className="space-y-4">
           <h4 className="text-xl font-semibold">Connect With Us</h4>
           <div className="flex space-x-4">
             <a
               href="https://github.com"
               target="_blank"
               rel="noopener noreferrer"
               className="text-gray-400 hover:text-white transition-colors"
             >
               <FaGithub size={24} />
             </a>
             <a
               href="https://linkedin.com"
               target="_blank"
               rel="noopener noreferrer"
               className="text-gray-400 hover:text-white transition-colors"
             >
               <FaLinkedin size={24} />
             </a>
             <a
               href="https://twitter.com"
               target="_blank"
               rel="noopener noreferrer"
               className="text-gray-400 hover:text-white transition-colors"
             >
               <FaTwitter size={24} />
             </a>
             <a
               href="mailto:contact@hirehub.com"
               className="text-gray-400 hover:text-white transition-colors"
             >
               <MdEmail size={24} />
             </a>
           </div>
         </div>
       </div>
        {/* Bottom Bar */}
       <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
         <p>© {new Date().getFullYear()} HireHub. All rights reserved.</p>
       </div>
     </div>
   </footer>
 )
}
export default Footer