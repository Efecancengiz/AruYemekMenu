// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: Replace the following with your app's Firebase project configuration
// BURAYA KENDİ FİREBASE BİLGİLERİNİZİ GİRİN
const firebaseConfig = {
    apiKey: "AIzaSyCh3hu17bjEm30-LvgZ-PtffH-qliBgdTc",
    authDomain: "aruyemek.firebaseapp.com",
    projectId: "aruyemek",
    storageBucket: "aruyemek.firebasestorage.app",
    messagingSenderId: "1094595918628",
    appId: "1:1094595918628:web:02c0d72c4428cbf72e11b1",
    measurementId: "G-SCKQ1SB6RG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, auth, db };
