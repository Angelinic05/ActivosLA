import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDV8Swrfk0Nf0CY3M9j1bggcu2XqXiVMWA",
    authDomain: "activos-3f904.firebaseapp.com",
    projectId: "activos-3f904",
    storageBucket: "activos-3f904.firebasestorage.app",
    messagingSenderId: "642860088796",
    appId: "1:642860088796:web:2bac7fabc73b0f3ce12319",
    measurementId: "G-DFPH537CSG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

        // auth.onAuthStateChanged(async (user) => {
        //     if (!user) {
        //         // Si no hay usuario autenticado, redirigir a la página de inicio de sesión
        //         window.location.href = 'https://angelinic05.github.io/ActivosLA/Login.html';
        //     } else {
        //         // Obtener el rol del usuario
        //         const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        //         const userData = userDoc.data();
        
        //         if (userData && userData.role) {
        //             // Cargar los colaboradores y pasar userData

        
        //             if (userData.role === "viewer") {
        //                 // Ocultar botones de crear, editar y eliminar
        //                 await loadHistorial(userData); // Asegúrate de pasar userData aquí
        //             }
        //         }
        //     }
        // });

        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = 'https://angelinic05.github.io/ActivosLA/Login.html';
            } else {
                const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                const userData = userDoc.data();
                
                if (userData && userData.role) {
                    await loadHistorial(userData); // Cargar el historial
                }
            }
        });

        
document.getElementById("logout-button").addEventListener("click", async () => {
    try {
        await signOut(auth);
            console.log("Usuario cerrado sesión");
                        // Redirigir a la página de inicio de sesión
                window.location.href = 'https://angelinic05.github.io/ActivosLA/Login.html';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
});




async function loadHistorial(userData) {
    const querySnapshot = await getDocs(collection(db, "historial"));
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = `
            <tr>
                <td>${data.fecha}</td>
                <td>${data.accion}</td>
            </tr>
        `;
        tableBody.innerHTML += row; // Agregar la fila a la tabla
    });
}