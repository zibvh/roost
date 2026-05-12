// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQe6XWAXaooIfA9oxwUzeyQWZ7rU3DfgQ",
  authDomain: "rooster-a908b.firebaseapp.com",
  projectId: "rooster-a908b",
  storageBucket: "rooster-a908b.firebasestorage.app",
  messagingSenderId: "579070547274",
  appId: "1:579070547274:web:b1a256884546d4f5d09db3",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
