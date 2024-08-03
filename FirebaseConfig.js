// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCxKfHd8wiNAIAwxJyOUJDlVLmtBplLcjQ",
    authDomain: "reactgroup7.firebaseapp.com",
    projectId: "reactgroup7",
    storageBucket: "reactgroup7.appspot.com",
    messagingSenderId: "321507455508",
    appId: "1:321507455508:web:864f7cc5edf255b55c6d01",
    measurementId: "G-W2TNEXFKWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };