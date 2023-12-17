// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


//Main-databas
const firebaseConfig = {
  apiKey: "AIzaSyDMGlAc6vqX-EeyXf_tn48hw6IW0svedcE",
  authDomain: "med-scan-9eb68.firebaseapp.com",
  projectId: "med-scan-9eb68", 
  storageBucket: "med-scan-9eb68.appspot.com",
  messagingSenderId: "779832264677",
  appId: "1:779832264677:web:c2c08111b71ab6a976910c"
}; 


// const firebaseConfig = {
//     apiKey: process.env.REACT_APP_apiKey,
//     authDomain: process.env.REACT_APP_authDomain,
//     projectId: process.env.REACT_APP_projectId,
//     storageBucket: process.env.REACT_APP_storageBucket,
//     messagingSenderId: process.env.REACT_APP_messaginSenderId,
//     appId: process.env.REACT_APP_appId
//   };


  // Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const db = getFirestore(FIREBASE_APP);