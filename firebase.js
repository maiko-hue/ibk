// firebase.js - EL CEREBRO DE INTERBANK (LOGIN + ANTI-CLON INDEPENDIENTE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Tus llaves de siempre (yapedata)
const firebaseConfig = {
  apiKey: "AIzaSyDHDXn-R6jgd4fBkgW4KzFp6p6Ym_yqQoI",
  authDomain: "yapedata.firebaseapp.com",
  projectId: "yapedata",
  storageBucket: "yapedata.firebasestorage.app",
  messagingSenderId: "228862586517",
  appId: "1:228862586517:web:4e2b2578fe0f826e32b59c"
};

// Inicializar todo
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();

export { auth, db, doc, setDoc, getDoc };

// --- LOGIN CON GOOGLE (VERSIÓN INTERBANK) ---
window.iniciarSesion = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // CAMBIO 1: Ahora guarda en su propia carpeta "clientes_ibk"
        const userRef = doc(db, "clientes_ibk", user.email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                nombre: user.displayName,
                email: user.email,
                estado: "inactivo", 
                fecha: new Date().toISOString()
            });
        }

        // 🛡️ --- SISTEMA ANTI-CLONACIÓN (IBK) --- 🛡️
        const ticketSesion = "token_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
        
        // CAMBIO 2: Guarda la llave en el celular con un nombre único para IBK
        localStorage.setItem("sesion_token_ibk", ticketSesion);
        
        await updateDoc(userRef, {
            sesion_token: ticketSesion
        });

        window.location.href = "login_pin.html";
    } catch (error) {
        alert("Error: " + error.message);
    }
};

// --- SEMÁFORO DE INGRESO DIRECTO ---
window.verificarSiYaEntro = function() {
    onAuthStateChanged(auth, (user) => {
        if (user) { 
            window.location.href = "login_pin.html"; 
        }
    });
};