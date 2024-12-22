import { faker } from '@faker-js/faker'
import { db } from '../firebase/config'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

const SKILLS_BY_CATEGORY = {
  'Frontend Development': [
    'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3',
    'Redux', 'Webpack', 'SASS/SCSS', 'Tailwind CSS', 'Bootstrap', 'Next.js',
    'Responsive Design', 'Web Performance', 'Jest', 'React Native'
  ],
  'Backend Development': [
    'Node.js', 'Python', 'Java', 'C#', '.NET', 'PHP', 'Ruby on Rails',
    'Express.js', 'Django', 'Spring Boot', 'RESTful APIs', 'GraphQL',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes'
  ],
  'DevOps': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'CI/CD', 'Linux', 'Shell Scripting', 'Terraform', 'Ansible', 'Git',
    'Monitoring', 'Security', 'Networking', 'Infrastructure as Code'
  ],
  'Data Science': [
    'Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning', 'TensorFlow',
    'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Data Visualization',
    'Statistics', 'Big Data', 'Hadoop', 'Spark', 'NLP'
  ],
  'Mobile Development': [
    'iOS', 'Android', 'Swift', 'Kotlin', 'React Native', 'Flutter',
    'Mobile UI Design', 'App Store Optimization', 'Push Notifications',
    'Mobile Security', 'Cross-Platform Development', 'Mobile Testing'
  ]
}

const COMPANIES = [
  { name: 'TechMahindra Solutions', industry: 'Technology', location: 'Pune' },
  { name: 'Infosys Digital', industry: 'IT Services', location: 'Bangalore' },
  { name: 'Wipro Technologies', industry: 'Technology', location: 'Bangalore' },
  { name: 'HCL TechVision', industry: 'Software Development', location: 'Noida' },
  { name: 'Tata Consultancy Services', industry: 'IT Services', location: 'Mumbai' },
  { name: 'Microsoft India', industry: 'Technology', location: 'Hyderabad' },
  { name: 'Google India', industry: 'Technology', location: 'Bangalore' },
  { name: 'Amazon Development Center', industry: 'E-commerce', location: 'Hyderabad' },
  { name: 'Accenture India', industry: 'Consulting', location: 'Bangalore' },
  { name: 'IBM India', industry: 'Technology', location: 'Bangalore' },
  { name: 'Deutsche Bank Tech', industry: 'FinTech', location: 'Berlin' },
  { name: 'Meta', industry: 'Social Media', location: 'California' },
  { name: 'Apple', industry: 'Technology', location: 'California' },
  { name: 'Intel', industry: 'Semiconductor', location: 'Oregon' },
  { name: 'SAP Labs', industry: 'Enterprise Software', location: 'Munich' }
]

const LOCATIONS = [
  'Remote',
  'Remote (India Only)',
  'Hybrid',
  // Indian Cities
  'Bangalore, Karnataka',
  'Mumbai, Maharashtra',
  'Delhi NCR',
  'Hyderabad, Telangana',
  'Chennai, Tamil Nadu',
  'Pune, Maharashtra',
  'Noida, Uttar Pradesh',
  'Gurgaon, Haryana',
  // International Cities
  'San Francisco, USA',
  'New York, USA',
  'London, UK',
  'Berlin, Germany',
  'Munich, Germany',
  'Singapore',
  'Dubai, UAE'
]

const BENEFITS = [
  // Health & Insurance
  'Comprehensive health insurance for employee & family',
  'Group term life insurance',
  'Dental and vision coverage',
  'Accident insurance',
  
  // Leave & Time Off
  'Flexible working hours',
  '30 days paid time off',
  'Paid maternity & paternity leave',
  'Sabbatical leave options',
  
  // Financial Benefits
  'Employee stock options (ESOP)',
  'Performance bonus',
  'Provident fund',
  'Gratuity',
  
  // Wellness & Development
  'Gym membership reimbursement',
  'Mental health support',
  'Learning & development allowance',
  'Professional certification support',
  
  // Work Setup
  'Work from home setup allowance',
  'Internet reimbursement',
  'Latest MacBook/Windows laptop',
  'Ergonomic office furniture',
  
  // Miscellaneous
  'Relocation assistance',
  'Food coupons',
  'Transport allowance',
  'Child education support'
]

const generateJobDescription = (title, skills) => {
  const intro = `We are seeking an experienced ${title} to join our dynamic team.`
  
  const responsibilities = [
    'Collaborate with cross-functional teams to design and implement solutions',
    'Write clean, maintainable, and efficient code',
    'Participate in code reviews and provide constructive feedback',
    'Troubleshoot and debug applications',
    'Optimize applications for maximum speed and scalability',
    'Stay up-to-date with emerging technologies',
    'Mentor junior developers and contribute to team growth',
    'Participate in agile ceremonies and sprint planning'
  ]

  const requirements = skills.map(skill => `Experience with ${skill}`)
  
  return `${intro}\n\n
    Key Responsibilities:\n
    ${responsibilities.map(r => `• ${r}`).join('\n')}\n\n
    Requirements:\n
    ${requirements.map(r => `• ${r}`).join('\n')}\n\n
    What We Offer:\n
    • Competitive salary and benefits package
    • Opportunity to work on cutting-edge technologies
    • Professional growth and development opportunities
    • Collaborative and innovative work environment
    • Option for flexible work arrangements`
}

const generateFakeJobs = async (count = 200) => {
  console.log('Starting job generation...')
  const jobs = []
  const categories = Object.keys(SKILLS_BY_CATEGORY)
  const jobsCollection = collection(db, 'jobs')

  try {
    console.log(`Will generate ${count} jobs`)

    for (let i = 0; i < count; i++) {
      const category = faker.helpers.arrayElement(categories)
      const company = faker.helpers.arrayElement(COMPANIES)
      const skills = faker.helpers.arrayElements(SKILLS_BY_CATEGORY[category], { min: 4, max: 8 })
      
      // Salary ranges based on experience and location
      let minSalary, maxSalary
      const isIndianCompany = company.location && ['Pune', 'Bangalore', 'Noida', 'Mumbai', 'Hyderabad'].includes(company.location)
      
      if (isIndianCompany) {
        // Indian salary ranges (in lakhs, converted to USD)
        minSalary = faker.number.int({ min: 8, max: 25 }) * 100000
        maxSalary = minSalary + faker.number.int({ min: 5, max: 15 }) * 100000
      } else {
        // International salary ranges (in USD)
        minSalary = faker.number.int({ min: 80000, max: 150000 })
        maxSalary = minSalary + faker.number.int({ min: 20000, max: 100000 })
      }

      const jobTitle = `${faker.helpers.arrayElement(['Senior', 'Lead', 'Staff', 'Principal', ''])} ${category.replace(' Development', '')} ${faker.helpers.arrayElement(['Engineer', 'Developer', 'Architect'])}`

      const job = {
        title: jobTitle,
        company: company.name,
        industry: company.industry,
        location: faker.helpers.arrayElement(LOCATIONS),
        type: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid']),
        experience: faker.helpers.arrayElement(['Entry Level', '1-3 years', '3-5 years', '5+ years', '7+ years', '10+ years']),
        description: generateJobDescription(jobTitle, skills),
        requirements: skills.map(skill => `${faker.number.int({ min: 1, max: 5 })}+ years of ${skill} experience`),
        skills: skills,
        minSalary,
        maxSalary,
        benefits: faker.helpers.arrayElements(BENEFITS, { min: 6, max: 10 }),
        postedAt: Timestamp.fromDate(faker.date.past({ days: 30 })),
        applicants: [],
        status: 'active',
        companyLogo: `https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        employerId: 'system',
        employerName: 'System Generated',
        workplaceType: faker.helpers.arrayElement(['Remote', 'Hybrid', 'On-site']),
        currency: isIndianCompany ? 'INR' : 'USD'
      }

      try {
        console.log(`Adding job ${i + 1}/${count} to Firebase:`, job.title)
        const docRef = await addDoc(jobsCollection, job)
        console.log(`Successfully added job with ID: ${docRef.id}`)
        jobs.push({ id: docRef.id, ...job })
      } catch (error) {
        console.error(`Failed to add job ${i + 1}:`, error)
      }
    }

    console.log(`Successfully generated ${jobs.length} jobs`)
    return jobs
  } catch (error) {
    console.error('Error in generateFakeJobs:', error)
    throw error
  }
}

export default generateFakeJobs
