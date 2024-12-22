import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ChatWindow from '../components/ChatWindow'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
function Chat() {
 const { chatId } = useParams()
 const navigate = useNavigate()
 const [chatDetails, setChatDetails] = useState(null)
 const [loading, setLoading] = useState(true)
  useEffect(() => {
   const fetchChatDetails = async () => {
     try {
       const chatDoc = await getDoc(doc(db, 'chats', chatId))
       if (chatDoc.exists()) {
         setChatDetails(chatDoc.data())
       } else {
         toast.error('Chat not found')
         navigate('/dashboard')
       }
     } catch (error) {
       console.error('Error fetching chat:', error)
       toast.error('Error loading chat')
     } finally {
       setLoading(false)
     }
   }
    fetchChatDetails()
 }, [chatId, navigate])
  if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
     </div>
   )
 }
  return (
   <motion.div 
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
   >
     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
       <ChatWindow chatId={chatId} chatDetails={chatDetails} />
     </div>
   </motion.div>
 )
}
export default Chat