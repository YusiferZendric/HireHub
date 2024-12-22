import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaBriefcase, FaUsers, FaComments, FaRocket } from 'react-icons/fa'

function Home() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100
      setIsVisible(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const features = [
    {
      icon: <FaBriefcase className="text-4xl text-blue-500" />,
      title: "Smart Job Matching",
      description: "Our AI-powered system matches you with the perfect opportunities based on your skills and preferences."
    },
    {
      icon: <FaUsers className="text-4xl text-green-500" />,
      title: "Direct Communication",
      description: "Connect directly with employers or candidates through our integrated chat system."
    },
    {
      icon: <FaComments className="text-4xl text-purple-500" />,
      title: "Real-time Updates",
      description: "Get instant notifications about job applications, interviews, and messages."
    },
    {
      icon: <FaRocket className="text-4xl text-red-500" />,
      title: "Career Growth",
      description: "Access resources and tools to help you grow in your career journey."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://source.unsplash.com/random/1920x1080?office')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>
        
        <motion.div 
          className="relative text-center text-white px-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Find Your Dream Career</h1>
          <p className="text-xl md:text-2xl mb-8">Connect with top employers and opportunities worldwide</p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold transition backdrop-blur-sm"
            >
              Browse Jobs
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose HireHub?</h2>
            <p className="text-xl text-gray-300">Revolutionizing the way people find and hire talent</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700"
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ delay: index * 0.2 }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-xl">Active Jobs</div>
            </motion.div>
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-xl">Companies</div>
            </motion.div>
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-xl">Happy Users</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home