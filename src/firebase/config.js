import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { enableIndexedDbPersistence } from 'firebase/firestore'

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUGyWey5tQXTTpbS86KEPSo5-2nQj88RY",
    authDomain: "main2-ae579.firebaseapp.com",
    projectId: "main2-ae579",
    storageBucket: "main2-ae579.appspot.com",
    messagingSenderId: "911209203188",
    appId: "1:911209203188:web:fbdec67891bf1c525525a1"
  };

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support persistence.')
    }
  })

export { db, auth, storage }