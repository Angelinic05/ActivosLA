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

        auth.onAuthStateChanged(async (user) => {
                    if (!user) {
                        // Si no hay usuario autenticado, redirigir a la página de inicio de sesión
                        window.location.href = 'https://angelinic05.github.io/ActivosLA/Login.html';
                    } else {
                        // Obtener el rol del usuario
                        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                        const userData = userDoc.data();
                
                        if (userData && userData.role) {
                            // Cargar los colaboradores y pasar userData
                            await loadCellphones(userData); // Asegúrate de pasar userData aquí
                
                            if (userData.role === "viewer") {
                                // Ocultar botones de crear, editar y eliminar
                                document.querySelector('.floating-button').style.display = 'none';
                                console.log("El usuario es un visualizador, se oculta el botón flotante.");
                
                                // Ocultar la columna de acciones
                                const actionColumnHeaders = document.querySelectorAll('th:nth-child(5)'); // Encabezado de la columna
                                const actionColumnCells = document.querySelectorAll('td:nth-child(5)'); // Celdas de la columna
                
                                // Ocultar encabezado
                                actionColumnHeaders.forEach(header => {
                                    header.style.display = 'none'; // Ocultar el encabezado de la columna
                                });
                
                                // Ocultar celdas
                                actionColumnCells.forEach(cell => {
                                    cell.style.display = 'none'; // Ocultar las celdas de la columna
                                });
                            }
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
    
        async function loadCellphones() {
            const querySnapshot = await getDocs(collection(db, "celulares"));
            const tableBody = document.querySelector("tbody");
            tableBody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = `
                    <tr>
                        <td>${data.placa}</td>
                        <td>${data.marca}</td>
                        <td>${data.modelo}</td>
                        <td>${data.serial}</td>
                        <td>
                            <div class="icons">
                                <a href="#" class="action-icon" title="Editar" onclick='openEditModal("${doc.id}", ${JSON.stringify(data).replace(/"/g, "&quot;")})'>
                                    <i class="bx bx-edit"></i>
                                </a>
                                <a href="#" class="action-icon delete" title="Eliminar" data-id="${doc.id}">
                                    <i class="bx bx-trash"></i>
                                </a>
                            </div>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row; // Agregar la fila a la tabla
            });

            // Agregar evento de clic a los enlaces de eliminación
            const deleteButtons = document.querySelectorAll('.delete');
            deleteButtons.forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault(); // Evitar el comportamiento por defecto del enlace
                    const docId = this.getAttribute('data-id'); // Obtener el ID del celular
                    deleteCellphone(docId); // Llamar a la función de eliminación
                });
            });
        }

        document.getElementById("cellphoneForm").onsubmit = async function(event) {
            event.preventDefault(); // Evitar el envío del formulario

            const docId = document.getElementById("cellphoneId").value; // Obtener el ID del celular
            const placa = document.getElementById("placa").value;
            const marca = document.getElementById("marca").value;
            const modelo = document.getElementById("modelo").value;
            const serial = document.getElementById("serial").value;

            if (docId) {
                // Actualizar el celular en Firestore
                await updateDoc(doc(db, "celulares", docId), {
                    placa: placa,
                    marca: marca,
                    modelo: modelo,
                    serial: serial
                });
            } else {
                // Agregar un nuevo celular
                await addDoc(collection(db, "celulares"), {
                    placa: placa,
                    marca: marca,
                    modelo: modelo,
                    serial: serial
                });
            }

            modal.style.display = "none"; // Cerrar el modal
            this.reset(); // Limpiar el formulario
            loadCellphones(); // Recargar la tabla
        }

        async function deleteCellphone(docId) {
            if (confirm("¿Estás seguro de que deseas eliminar este celular?")) {
                try {
                    await deleteDoc(doc(db, "celulares", docId)); // Eliminar el documento en Firestore
                    alert("Celular eliminado correctamente.");
                    loadCellphones(); // Recargar la lista de celulares
                } catch (error) {
                    console.error("Error al eliminar celular:", error);
                    alert("Hubo un error al eliminar el celular.");
                }
            }
        }

        function openEditModal(docId, data) {
            // Abrir el modal
            modal.style.display = "block";
            // Asignar el ID del celular al campo oculto
            document.getElementById("cellphoneId").value = docId;
            // Rellenar los campos del formulario con la información del celular
            document.getElementById("placa").value = data.placa || "";
            document.getElementById("marca").value = data.marca || "";
            document.getElementById("modelo").value = data.modelo || "";
            document.getElementById("serial").value = data.serial || "";
        }

        window.openEditModal = openEditModal;

        window.onload = function() {
            loadCellphones(); // Cargar celulares al iniciar
        }

        var modal = document.getElementById("myModal");
        var btn = document.querySelector(".floating-button");
        var close = document.getElementById("closex");

        btn.onclick = function() {
            modal.style.display = "block";
            // Limpiar los campos del formulario al abrir el modal
            document.getElementById("cellphoneId").value = ""; // Limpiar el ID al abrir el modal
            document.getElementById("placa").value = ""; // Limpiar la placa
            document.getElementById("marca").value = ""; // Limpiar la marca
            document.getElementById("modelo").value = ""; // Limpiar el modelo
            document.getElementById("serial").value = ""; // Limpiar el serial
        }

        close.onclick = function() {
            modal.style.display = "none";
            // Limpiar los campos del formulario al cerrar el modal
            document.getElementById("cellphoneId").value = ""; // Limpiar el ID al cerrar el modal
            document.getElementById("placa").value = ""; // Limpiar la placa
            document.getElementById("marca").value = ""; // Limpiar la marca
            document.getElementById("modelo").value = ""; // Limpiar el modelo
            document.getElementById("serial").value = ""; // Limpiar el serial
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                // Limpiar los campos del formulario al cerrar el modal
                document.getElementById("cellphoneId").value = ""; // Limpiar el ID al cerrar el modal
                document.getElementById("placa").value = ""; // Limpiar la placa
                document.getElementById("marca").value = ""; // Limpiar la marca
                document.getElementById("modelo").value = ""; // Limpiar el modelo
                document.getElementById("serial").value = ""; // Limpiar el serial
            }
        }