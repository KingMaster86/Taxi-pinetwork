// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAlKOlAxaXuGEL0nN0zH6TaKIjskS-ZyOw",
  authDomain: "taxi-pi-network.firebaseapp.com",
  databaseURL: "https://taxi-pi-network-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "taxi-pi-network",
  storageBucket: "taxi-pi-network.firebasestorage.app",
  messagingSenderId: "424683034285",
  appId: "1:424683034285:web:78d616a9dd98a78a0cd824",
  measurementId: "G-62J9SRR509",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
