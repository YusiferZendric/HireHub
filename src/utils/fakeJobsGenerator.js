import { faker } from '@faker-js/faker'
import { db } from '../firebase/config'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive']
const skills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'AWS', 'Docker',
  'Kubernetes', 'SQL', 'MongoDB', 'TypeScript', 'Angular', 'Vue.js', 'PHP',
  'Ruby', 'Swift', 'Kotlin', 'Go', 'Rust', 'DevOps', 'Machine Learning',
  'Data Science', 'AI', 'Blockchain', 'Cloud Computing', 'UI/UX Design',
  'Product Management', 'Agile', 'Scrum', 'Digital Marketing', 'SEO',
  'Content Writing', 'Graphic Design', 'Mobile Development', 'iOS', 'Android'
]

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Twitter',
  'Uber', 'Airbnb', 'Spotify', 'Adobe', 'Intel', 'IBM', 'Oracle', 'Salesforce',
  'LinkedIn', 'PayPal', 'NVIDIA', 'Zoom', 'Slack', 'Shopify', 'Square', 'Stripe'
]

const jobTitles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
  'System Administrator', 'Cloud Architect', 'Mobile Developer', 'AI Engineer',
  'Machine Learning Engineer', 'QA Engineer', 'Security Engineer', 'Site Reliability Engineer',
  'Technical Lead', 'Engineering Manager', 'CTO', 'VP of Engineering',
  'Product Designer', 'UI Designer', 'Technical Writer', 'Scrum Master'
]

const benefits = [
  'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401(k) Plan',
  'Stock Options', 'Unlimited PTO', 'Remote Work', 'Flexible Hours',
  'Professional Development', 'Gym Membership', 'Mental Health Benefits',
  'Parental Leave', 'Life Insurance', 'Performance Bonus', 'Sign-on Bonus',
  'Annual Bonus', 'Company Events', 'Free Lunch', 'Home Office Stipend',
  'Internet Stipend', 'Education Reimbursement', 'Commuter Benefits'
]

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
  'Boston, MA', 'Los Angeles, CA', 'Chicago, IL', 'Denver, CO',
  'Portland, OR', 'Miami, FL', 'Atlanta, GA', 'Washington, DC',
  'San Diego, CA', 'Nashville, TN', 'Remote', 'Hybrid Remote'
]

const generateFakeJob = (employerId, employerName) => {
  const minSalary = faker.number.int({ min: 50000, max: 150000 })
  const maxSalary = faker.number.int({ min: minSalary + 20000, max: minSalary + 100000 })
  const applicantCount = faker.number.int({ min: 50, max: 500 })
  const requiredSkills = faker.helpers.arrayElements(skills, { min: 4, max: 8 })
  const jobBenefits = faker.helpers.arrayElements(benefits, { min: 5, max: 8 })
  const postedDate = faker.date.recent({ days: 30 })
  
  // Generate fake applicants with realistic timestamps
  const applicants = Array.from({ length: applicantCount }, () => ({
    userId: faker.string.uuid(),
    appliedAt: Timestamp.fromMillis(
      faker.date.between({
        from: postedDate,
        to: new Date()
      }).getTime()
    )
  }))

  return {
    title: faker.helpers.arrayElement(jobTitles),
    company: faker.helpers.arrayElement(companies),
    location: faker.helpers.arrayElement(locations),
    type: faker.helpers.arrayElement(jobTypes),
    description: faker.lorem.paragraphs(4),
    requirements: [
      ...faker.lorem.paragraphs(2).split('\n'),
      '• ' + requiredSkills.join('\n• ')
    ].join('\n'),
    responsibilities: faker.lorem.paragraphs(3).split('\n').map(p => '• ' + p).join('\n'),
    minSalary,
    maxSalary,
    experienceLevel: faker.helpers.arrayElement(experienceLevels),
    skills: requiredSkills,
    postedAt: Timestamp.fromMillis(postedDate.getTime()),
    postedBy: employerId,
    postedByName: employerName,
    applicants,
    benefits: jobBenefits,
    status: 'active',
    department: faker.commerce.department(),
    workSchedule: faker.helpers.arrayElement(['9-5', 'Flexible', 'Shifts', '4-day week']),
    employmentType: faker.helpers.arrayElement(['Permanent', 'Contract', 'Temporary']),
    educationLevel: faker.helpers.arrayElement(['Bachelor\'s', 'Master\'s', 'PhD', 'High School', 'Associate\'s']),
    industry: faker.company.buzzNoun()
  }
}

export const generateAndUploadFakeJobs = async (employerId, employerName, count = 200) => {
  try {
    console.log('Starting job generation...')
    const jobsCollection = collection(db, 'jobs')
    const jobs = Array.from({ length: count }, () => generateFakeJob(employerId, employerName))
    
    console.log(`Generated ${jobs.length} jobs in memory, starting upload...`)
    
    // Upload jobs in smaller batches to avoid Firestore limits
    const batchSize = 10
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize)
      await Promise.all(batch.map(job => addDoc(jobsCollection, job)))
      console.log(`Uploaded batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(jobs.length/batchSize)}`)
    }
    
    console.log('All jobs uploaded successfully')
    return true
  } catch (error) {
    console.error('Error generating fake jobs:', error)
    return false
  }
}
