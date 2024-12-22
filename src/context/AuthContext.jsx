import { createContext, useContext, useState, useEffect } from 'react'
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth()

  async function signup(email, password, role) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      setUserRole(role)
      return user
    } catch (error) {
      throw error
    }
  }

  async function login(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role)
      }
      return user
    } catch (error) {
      throw error
    }
  }

  function logout() {
    setUserRole(null)
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserRole(userData.role)
            console.log('User role set:', userData.role)
          } else {
            console.log('No user document found')
            setUserRole(null)
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
          setUserRole(null)
        }
      } else {
        setUserRole(null)
      }
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [auth])

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
