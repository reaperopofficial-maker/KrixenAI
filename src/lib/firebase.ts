/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAwG6oRRbkyflZRSVMckIT2Jl31yYShdZM",
  authDomain: "krixen-169f4.firebaseapp.com",
  databaseURL: "https://krixen-169f4-default-rtdb.firebaseio.com",
  projectId: "krixen-169f4",
  storageBucket: "krixen-169f4.firebasestorage.app",
  messagingSenderId: "527262526140",
  appId: "1:527262526140:web:1c5e470668bf14588efeb9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
