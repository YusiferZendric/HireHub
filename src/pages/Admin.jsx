import { useState } from 'react'
import generateFakeJobs from '../utils/generateFakeJobs'
import toast from 'react-hot-toast'

function AdminPanel() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobCount, setJobCount] = useState(0)

  const handleGenerateJobs = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    toast.loading('Starting job generation...', { id: 'admin-generating' })
    
    try {
      console.log('Starting job generation from admin panel...')
      const jobs = await generateFakeJobs(200)
      console.log('Jobs generated:', jobs.length)
      setJobCount(prev => prev + jobs.length)
      toast.success(`Successfully generated ${jobs.length} jobs!`, { id: 'admin-generating' })
    } catch (error) {
      console.error('Error generating jobs:', error)
      toast.error('Failed to generate jobs. Check console for details.', { id: 'admin-generating' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Job Generation</h2>
              <p className="text-gray-400 mb-4">
                Total Jobs Generated: {jobCount}
              </p>
              <button
                onClick={handleGenerateJobs}
                disabled={isGenerating}
                className={`px-6 py-3 rounded-lg ${
                  isGenerating 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium transition-colors`}
              >
                {isGenerating ? 'Generating Jobs...' : 'Generate 200 Jobs'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
