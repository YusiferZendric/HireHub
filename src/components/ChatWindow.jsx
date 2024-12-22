import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi'
function ChatWindow({ chatId }) {
 const [messages, setMessages] = useState([])
 const [input, setInput] = useState('')
 const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
 }
  useEffect(() => {
   scrollToBottom()
 }, [messages])
  const sendMessage = () => {
   if (!input.trim()) return
   
   // Add message to state (replace with Firebase logic)
   setMessages([...messages, {
     id: Date.now(),
     sender: 'You',
     text: input,
     timestamp: new Date(),
   }])
   setInput('')
 }
  const handleKeyPress = (e) => {
   if (e.key === 'Enter' && !e.shiftKey) {
     e.preventDefault()
     sendMessage()
   }
 }
  return (
   <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg">
     {/* Chat Header */}
     <div className="p-4 border-b bg-blue-600 rounded-t-xl">
       <div className="flex items-center space-x-4">
         <div className="relative">
           <img
             src="/default-avatar.png"
             alt="Chat Avatar"
             className="w-10 h-10 rounded-full border-2 border-white"
           />
           <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
         </div>
         <div>
           <h3 className="font-medium text-white">Chat with {chatId}</h3>
           <p className="text-blue-100 text-sm">Online</p>
         </div>
       </div>
     </div>
      {/* Messages Area */}
     <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
       {messages.map((msg, index) => (
         <motion.div
           key={msg.id || index}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
         >
           <div className={`max-w-[70%] rounded-lg p-3 ${
             msg.sender === 'You' 
               ? 'bg-blue-600 text-white rounded-br-none'
               : 'bg-white text-gray-800 rounded-bl-none shadow-md'
           }`}>
             <p>{msg.text}</p>
             <span className="text-xs opacity-70 mt-1 block">
               {new Date(msg.timestamp).toLocaleTimeString()}
             </span>
           </div>
         </motion.div>
       ))}
       <div ref={messagesEndRef} />
     </div>
      {/* Input Area */}
     <div className="p-4 border-t bg-white rounded-b-xl">
       <div className="flex items-center space-x-4">
         <button className="text-gray-500 hover:text-blue-600 transition-colors">
           <FiPaperclip size={20} />
         </button>
         <button className="text-gray-500 hover:text-blue-600 transition-colors">
           <FiSmile size={20} />
         </button>
         <input
           type="text"
           value={input}
           onChange={(e) => setInput(e.target.value)}
           onKeyPress={handleKeyPress}
           placeholder="Type your message..."
           className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
         />
         <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={sendMessage}
           className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
         >
           <FiSend size={20} />
         </motion.button>
       </div>
     </div>
   </div>
 )
}
export default ChatWindow