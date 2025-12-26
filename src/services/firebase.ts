import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAKY_FRpVi0-Is1FRzvkXjB7_EdkKSVXeA",
  authDomain: "new-genesis-e9317.firebaseapp.com",
  projectId: "new-genesis-e9317",
  storageBucket: "new-genesis-e9317.firebasestorage.app",
  messagingSenderId: "482806102988",
  appId: "1:482806102988:web:7461f54990480982d67b69"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);