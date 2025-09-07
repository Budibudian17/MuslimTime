import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCoy5NalIUJ-16FslBltcfTSK26RQnYMps",
    authDomain: "muslimtime-c4027.firebaseapp.com",
    projectId: "muslimtime-c4027",
    storageBucket: "muslimtime-c4027.firebasestorage.app",
    messagingSenderId: "688902933632",
    appId: "1:688902933632:web:9f2e660b1403decfc9aa65",
    measurementId: "G-XCZYRH8S03"
  };

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
