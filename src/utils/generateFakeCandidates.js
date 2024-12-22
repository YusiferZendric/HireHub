import { faker } from '@faker-js/faker/locale/en'
import { db } from '../firebase/config'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

const UNIVERSITIES = [
  'Indian Institute of Technology, Bombay',
  'Indian Institute of Technology, Delhi',
  'Indian Institute of Technology, Madras',
  'National Institute of Technology, Trichy',
  'BITS Pilani',
  'Delhi Technological University',
  'VIT Vellore',
  'Manipal Institute of Technology',
  'Stanford University',
  'Massachusetts Institute of Technology',
  'Technical University of Munich',
  'ETH Zurich'
]

const COMPANIES = [
  'TCS',
  'Infosys',
  'Wipro',
  'HCL Technologies',
  'Tech Mahindra',
  'Microsoft',
  'Google',
  'Amazon',
  'IBM',
  'Accenture'
]

const SKILLS = {
  technical: [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'Angular', 'Vue.js', 'MongoDB', 'SQL', 'AWS', 'Docker',
    'Kubernetes', 'Machine Learning', 'Data Science', 'DevOps',
    'Git', 'CI/CD', 'Cloud Computing', 'Microservices'
  ],
  soft: [
    'Leadership', 'Communication', 'Problem Solving', 'Team Work',
    'Time Management', 'Adaptability', 'Critical Thinking',
    'Project Management', 'Agile Methodologies', 'Presentation Skills'
  ]
}

const LANGUAGES = [
  { name: 'English', level: ['Native', 'Fluent', 'Professional', 'Intermediate'] },
  { name: 'Hindi', level: ['Native', 'Fluent', 'Professional', 'Intermediate'] },
  { name: 'German', level: ['Professional', 'Intermediate', 'Basic'] },
  { name: 'French', level: ['Professional', 'Intermediate', 'Basic'] },
  { name: 'Spanish', level: ['Professional', 'Intermediate', 'Basic'] }
]

const generateEducation = () => {
  const university = faker.helpers.arrayElement(UNIVERSITIES)
  const degree = faker.helpers.arrayElement([
    'B.Tech in Computer Science',
    'B.Tech in Information Technology',
    'B.Tech in Electronics',
    'M.Tech in Computer Science',
    'Masters in Computer Applications',
    'MSc in Data Science',
    'BSc in Computer Science'
  ])
  
  const endYear = faker.number.int({ min: 2018, max: 2024 })
  const startYear = endYear - faker.number.int({ min: 3, max: 4 })
  const gpa = faker.number.float({ min: 7.0, max: 10.0, precision: 0.1 })
  
  return {
    university,
    degree,
    startYear,
    endYear,
    gpa,
    achievements: [
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ]
  }
}

const generateWorkExperience = () => {
  const experiences = []
  const numExperiences = faker.number.int({ min: 1, max: 3 })
  
  for (let i = 0; i < numExperiences; i++) {
    const company = faker.helpers.arrayElement(COMPANIES)
    const role = faker.helpers.arrayElement([
      'Software Engineer',
      'Senior Developer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'DevOps Engineer',
      'Data Scientist'
    ])
    
    const endDate = i === 0 ? 'Present' : faker.date.past({ years: i })
    const startDate = faker.date.past({ years: i + 2 })
    
    experiences.push({
      company,
      role,
      startDate,
      endDate,
      responsibilities: [
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence()
      ]
    })
  }
  
  return experiences
}

const generateCandidate = () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const email = faker.internet.email({ firstName, lastName })
  
  const technicalSkills = faker.helpers.arrayElements(SKILLS.technical, { min: 5, max: 8 })
  const softSkills = faker.helpers.arrayElements(SKILLS.soft, { min: 3, max: 5 })
  
  const spokenLanguages = faker.helpers.arrayElements(LANGUAGES, { min: 2, max: 4 })
    .map(lang => ({
      name: lang.name,
      level: faker.helpers.arrayElement(lang.level)
    }))

  return {
    uid: faker.string.uuid(),
    personalInfo: {
      firstName,
      lastName,
      email,
      phone: faker.phone.number('+91 ##########'),
      location: faker.helpers.arrayElement([
        'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune',
        'Chennai', 'Kolkata', 'San Francisco', 'New York', 'London'
      ]),
      about: faker.lorem.paragraph(),
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + firstName + lastName,
      linkedIn: 'https://linkedin.com/in/' + firstName.toLowerCase() + '-' + lastName.toLowerCase(),
      github: 'https://github.com/' + firstName.toLowerCase() + lastName.toLowerCase(),
      portfolio: 'https://' + firstName.toLowerCase() + lastName.toLowerCase() + '.dev'
    },
    education: generateEducation(),
    workExperience: generateWorkExperience(),
    skills: {
      technical: technicalSkills,
      soft: softSkills
    },
    languages: spokenLanguages,
    projects: [
      {
        name: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        technologies: faker.helpers.arrayElements(technicalSkills, { min: 2, max: 4 }),
        link: faker.internet.url()
      },
      {
        name: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        technologies: faker.helpers.arrayElements(technicalSkills, { min: 2, max: 4 }),
        link: faker.internet.url()
      }
    ],
    certifications: [
      {
        name: faker.helpers.arrayElement([
          'AWS Certified Developer',
          'Google Cloud Professional',
          'Microsoft Azure Developer',
          'MongoDB Developer',
          'React Developer Certification',
          'Kubernetes Administrator'
        ]),
        issuer: faker.helpers.arrayElement([
          'Amazon Web Services',
          'Google',
          'Microsoft',
          'MongoDB University',
          'Meta',
          'Linux Foundation'
        ]),
        year: faker.number.int({ min: 2020, max: 2023 })
      }
    ],
    preferences: {
      jobTypes: faker.helpers.arrayElements(['Full-time', 'Part-time', 'Contract', 'Remote'], { min: 1, max: 2 }),
      expectedSalary: {
        min: faker.number.int({ min: 10, max: 30 }) * 100000,
        max: faker.number.int({ min: 40, max: 80 }) * 100000
      },
      preferredLocations: faker.helpers.arrayElements([
        'Bangalore', 'Mumbai', 'Delhi', 'Remote',
        'Hyderabad', 'Pune', 'Chennai', 'Any Location'
      ], { min: 2, max: 4 })
    },
    status: 'active',
    createdAt: Timestamp.now(),
    lastActive: Timestamp.now()
  }
}

const generateFakeCandidates = async (count = 50) => {
  console.log('Starting candidate generation...')
  const candidates = []
  const candidatesCollection = collection(db, 'candidates')

  try {
    console.log('Will generate ' + count + ' candidates')

    for (let i = 0; i < count; i++) {
      const candidate = generateCandidate()

      try {
        console.log('Adding candidate ' + (i + 1) + '/' + count)
        const docRef = await addDoc(candidatesCollection, candidate)
        console.log('Successfully added candidate with ID: ' + docRef.id)
        candidates.push({ id: docRef.id, ...candidate })
      } catch (error) {
        console.error('Failed to add candidate ' + (i + 1) + ':', error)
      }
    }

    console.log('Successfully generated ' + candidates.length + ' candidates')
    return candidates
  } catch (error) {
    console.error('Error in generateFakeCandidates:', error)
    throw error
  }
}

export default generateFakeCandidates
