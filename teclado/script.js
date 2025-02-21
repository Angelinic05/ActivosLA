import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
        import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
        import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
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
        const db = getFirestore(app);
        const auth = getAuth(app);

        auth.onAuthStateChanged((user) => {
            if (!user) {
                // Si no hay usuario autenticado, redirigir a la página de inicio de sesión
                window.location.href = 'https://angelinic05.github.io/ActivosLA/Login.html'; // Cambia esto a la URL de tu página de inicio de sesión
            } else {
                // Cargar los colaboradores si el usuario está autenticado

            }
        });
    
        async function loadKeyboards() {
            const querySnapshot = await getDocs(collection(db, "teclados"));
            const tableBody = document.querySelector("tbody");
            tableBody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = `
                    <tr>
                        <td>${data.placa}</td>
                        <td>${data.marca}</td>
                        <td>${data.tipo}</td>
                        <td>${data.serial}</td>
                        <td>
                            <div class="icons">
                                <a href="#" class="action-icon" title="Editar" onclick='openEditModal("${doc.id}", ${JSON.stringify(data).replace(/"/g, "&quot;")})'>
                                    <i class="bx bx-edit"></i>
                                </a>
                                <a href="#" class="action-icon delete" title="Eliminar " data-id="${doc.id}">
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
                    const docId = this.getAttribute('data-id'); // Obtener el ID del teclado
                    deleteKeyboard(docId); // Llamar a la función de eliminación
                });
            });
        }

        document.getElementById("keyboardForm").onsubmit = async function(event) {
            event.preventDefault(); // Evitar el envío del formulario

            const docId = document.getElementById("keyboardId").value; // Obtener el ID del teclado
            const placa = document.getElementById("placa").value;
            const marca = document.getElementById("marca").value;
            const tipo = document.getElementById("tipo").value;
            const serial = document.getElementById("serial").value;

            if (docId) {
                // Actualizar el teclado en Firestore
                await updateDoc(doc(db, "teclados", docId), {
                    placa: placa,
                    marca: marca,
                    tipo: tipo,
                    serial: serial
                });
            } else {
                // Agregar un nuevo teclado
                await addDoc(collection(db, "teclados"), {
                    placa: placa,
                    marca: marca,
                    tipo: tipo,
                    serial: serial
                });
            }

            modal.style.display = "none"; // Cerrar el modal
            this.reset(); // Limpiar el formulario
            loadKeyboards(); // Recargar la tabla
        }

        async function deleteKeyboard(docId) {
            if (confirm("¿Estás seguro de que deseas eliminar este teclado?")) {
                try {
                    await deleteDoc(doc(db, "teclados", docId)); // Eliminar el documento en Firestore
                    alert("Teclado eliminado correctamente.");
                    loadKeyboards(); // Recargar la lista de teclados
                } catch (error) {
                    console.error("Error al eliminar teclado:", error);
                    alert("Hubo un error al eliminar el teclado.");
                }
            }
        }

        function openEditModal(docId, data) {
            // Abrir el modal
            modal.style.display = "block";
            // Asignar el ID del teclado al campo oculto
            document.getElementById("keyboardId").value = docId;
            // Rellenar los campos del formulario con la información del teclado
            document.getElementById("placa").value = data.placa || "";
            document.getElementById("marca").value = data.marca || "";
            document.getElementById("tipo").value = data.tipo || "inalambrico"; // Valor por defecto
            document.getElementById("serial").value = data.serial || "";
        }

        window.openEditModal = openEditModal;

        window.onload = function() {
            loadKeyboards(); // Cargar teclados al iniciar
        }

        var modal = document.getElementById("myModal");
        var btn = document.querySelector(".floating-button");
        var close = document.getElementById("closex");

        btn.onclick = function() {
            modal.style.display = "block";
            // Limpiar los campos del formulario al abrir el modal
            document.getElementById("keyboardId").value = ""; // Limpiar el ID al abrir el modal
            document.getElementById("placa").value = ""; // Limpiar la placa
            document.getElementById("marca").value = ""; // Limpiar la marca
            document.getElementById("tipo").value = "inalambrico"; // Valor por defecto
            document.getElementById("serial").value = ""; // Limpiar el serial
        }

        close.onclick = function() {
            modal.style.display = "none";
            // Limpiar los campos del formulario al cerrar el modal
            document.getElementById("keyboardId").value = ""; // Limpiar el ID al cerrar el modal
            document.getElementById("placa").value = ""; // Limpiar la placa
            document.getElementById("marca").value = ""; // Limpiar la marca
            document.getElementById("tipo").value = "inalambrico"; // Valor por defecto
            document.getElementById("serial").value = ""; // Limpiar el serial
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                // Limpiar los campos del formulario al cerrar el modal
                document.getElementById("keyboardId").value = ""; // Limpiar el ID al cerrar el modal
                document.getElementById("placa").value = ""; // Limpiar la placa
                document.getElementById("marca").value = ""; // Limpiar la marca
                document.getElementById("tipo").value = "inalambrico"; // Valor por defecto
                document.getElementById("serial").value = ""; // Limpiar el serial
            }
        }