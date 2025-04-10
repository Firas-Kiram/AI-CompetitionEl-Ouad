import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4dQaW5tHcoPhz6Koa_hPBgUPSFepuFIY",
  authDomain: "unisphere-af6b8.firebaseapp.com",
  projectId: "unisphere-af6b8",
  storageBucket: "unisphere-af6b8.firebasestorage.app",
  messagingSenderId: "579371897054",
  appId: "1:579371897054:web:a965a28559fb54d9d6724f",
  measurementId: "G-PL7XFQQW1R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);