import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHDXn-R6jgd4fBkgW4KzFp6p6Ym_yqQoI",
  authDomain: "yapedata.firebaseapp.com",
  projectId: "yapedata",
  storageBucket: "yapedata.firebasestorage.app",
  messagingSenderId: "228862586517",
  appId: "1:228862586517:web:4e2b2578fe0f826e32b59c",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, auth, db };
