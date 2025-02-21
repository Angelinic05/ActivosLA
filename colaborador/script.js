import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
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
        const auth = getAuth(app);
        const analytics = getAnalytics(app);
        const db = getFirestore(app);

        auth.onAuthStateChanged((user) => {
            if (!user) {
                // Si no hay usuario autenticado, redirigir a la página de inicio de sesión
                window.location.href = 'https://angelinic05.github.io/ActivosLA/Login.html'; // Cambia esto a la URL de tu página de inicio de sesión
            } else {
                // Cargar los colaboradores si el usuario está autenticado
            }
        });
    
        async function loadCollaborators() {
            const querySnapshot = await getDocs(collection(db, "colaboradores"));
            const tableBody = document.querySelector("tbody");
            tableBody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos

            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                const computerData = await getComputerData(data.computerId); // Obtener datos del computador
                const keyboardData = await getKeyboardData(data.keyboardId); // Obtener datos del teclado
                const mouseData = await getMouseData(data.mouseId); // Obtener datos del mouse
                const celularData = await getCelularData(data.celularId); // Obtener datos del mouse
                const baseData = await getBaseData(data.baseId);
                const posapiesData = await getPosapiesData(data.posapiesId);
                const row = `
                    <tr>
                        <td>${data.nombre}</td>
                        <td>${data.cedula}</td>
                        <td>${data.area}</td>
                        <td>${computerData ? `${computerData.placa} ${computerData.marca} (${computerData.tipo})` : "Ninguno"}</td>
                        <td>${keyboardData ? `${keyboardData.placa} ${keyboardData.marca}` : "Ninguno"}</td>
                        <td>${mouseData ? `${mouseData.placa} ${mouseData.marca}` : "Ninguno"}</td>
                        <td>${celularData ? `${celularData.placa} ${celularData.marca} ${celularData.modelo}` : "Ninguno"}</td>
                        <td>${baseData ? `${baseData.placa}` : "Ninguno"}</td>
                        <td>${posapiesData ? `${posapiesData.placa}` : "Ninguno"}</td>
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
            }

            // Agregar evento de clic a los enlaces de eliminación
            const deleteButtons = document.querySelectorAll('.delete');
            deleteButtons.forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault(); // Evitar el comportamiento por defecto del enlace
                    const docId = this.getAttribute('data-id'); // Obtener el ID del colaborador
                    deleteCollaborator(docId); // Llamar a la función de eliminación
                });
            });
        }

        

        async function getComputerData(computerId) {
            if (!computerId || computerId === "N/A") return null; // Si no hay ID o es N/A, retornar null
            const docRef = doc(db, "computadores", computerId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null; // Retornar los datos del computador
        }

        async function getKeyboardData(keyboardId) {
            if(!keyboardId || keyboardId === "N/A") return null; // Si no hay ID o es N/A, retornar null
            const docRef = doc(db, "teclados", keyboardId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null; // Retornar los datos del teclado
        }

        async function getMouseData(mouseId) {
            if (!mouseId || mouseId === "N/A") return null; // Si no hay ID o es N/A, retornar null
            const docRef = doc(db, "mouses", mouseId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null; // Retornar los datos del mouse
        }

        async function getCelularData(celularId) {
            if (!celularId || celularId === "N/A") return null; // Si no hay ID o es N/A, retornar null
            const docRef = doc(db, "celulares", celularId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null; // Retornar los datos del mouse
        }

        async function getBaseData(baseId) {
            if (!baseId || baseId === "N/A") return null; // Si no hay ID o es N/A, retornar null
            const docRef = doc(db, "bases", baseId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null; // Retornar los datos del mouse
        }

        async function getPosapiesData(posapiesId) {
            if (!posapiesId || posapiesId === "N/A") return null; // Si no hay ID o es N/A, retornar null
            const docRef = doc(db, "posapies", posapiesId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null; // Retornar los datos del mouse
        }

        async function loadComputers(collaboratorId = null) {
            const querySnapshot = await getDocs(collection(db, "computadores"));
            const computerSelect = document.getElementById("computerSelect");
            computerSelect.innerHTML = ""; // Limpiar las opciones antes de cargar nuevos datos

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Seleccione un computador";
            computerSelect.appendChild(defaultOption);

            const naOption = document.createElement("option");
            naOption.value = "N/A";
            naOption.textContent = "N/A (No Aplica)";
            computerSelect.appendChild(naOption); // Agregar opción N/A

            const assignedComputers = new Set(); // Para almacenar los IDs de computadores asignados

            // Cargar los computadores asignados solo si estamos creando un nuevo colaborador
            if (!collaboratorId) {
                const collaboratorsSnapshot = await getDocs(collection(db, "colaboradores"));
                collaboratorsSnapshot.forEach((collabDoc) => {
                    const collabData = collabDoc.data();
                    if (collabData.computerId && collabData.computerId !== "N/A") {
                        assignedComputers.add(collabData.computerId); // Agregar ID a la lista de asignados
                    }
                });
            }

    // Cargar todos los computadores
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const option = document.createElement("option");
        option.value = doc.id; // ID del computador
        option.textContent = `${data.placa} - ${data.marca} (${data.tipo})`; // Mostrar placa, marca y tipo

        // Si estamos creando un nuevo colaborador, solo agregar computadores no asignados
        if (!collaboratorId && assignedComputers.has(doc.id)) {
            // No agregar la opción si ya está asignado
            return;
        }

        computerSelect.appendChild(option);
    });

    // Si estamos editando un colaborador, seleccionar el computador asignado
    if (collaboratorId) {
        const collaboratorDoc = await getDoc(doc(db, "colaboradores", collaboratorId));
        const collaboratorData = collaboratorDoc.data();
        if (collaboratorData && collaboratorData.computerId) {
            computerSelect.value = collaboratorData.computerId; // Seleccionar el computador asignado
        }
    }
}

        async function loadKeyboards() {
            const querySnapshot = await getDocs(collection(db, "teclados"));
            const keyboardSelect = document.getElementById("keyboardSelect");
            keyboardSelect.innerHTML = ""; // Limpiar las opciones antes de cargar nuevos datos

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Seleccione un teclado";
            keyboardSelect.appendChild(defaultOption);

            const naOption = document.createElement("option");
            naOption.value = "N/A";
            naOption.textContent = "N/A (No Aplica)";
            keyboardSelect.appendChild(naOption); // Agregar opción N/A

            const assignedKeyboards = new Set(); // Para almacenar los IDs de teclados asignados

            const collaboratorsSnapshot = await getDocs(collection(db, "colaboradores"));
            collaboratorsSnapshot.forEach((collabDoc) => {
                const collabData = collabDoc.data();
                if (collabData.keyboardId && collabData.keyboardId !== "N/A") {
                    assignedKeyboards.add(collabData.keyboardId); // Agregar ID a la lista de asignados
                }
            });

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!assignedKeyboards.has(doc.id)) { // Verificar si el teclado ya está asignado
                    const option = document.createElement("option");
                    option.value = doc.id; // ID del teclado
                    option.textContent = `${data.placa} - ${data.marca}`; // Mostrar placa y marca
                    keyboardSelect.appendChild(option);
                }
            });
        }

        async function loadMouses() {
            const querySnapshot = await getDocs(collection(db, "mouses"));
            const mouseSelect = document.getElementById("mouseSelect");
            mouseSelect.innerHTML = ""; // Limpiar las opciones antes de cargar nuevos datos

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Seleccione un mouse";
            mouseSelect.appendChild(defaultOption);

            const naOption = document.createElement("option");
            naOption.value = "N/A";
            naOption.textContent = "N/A (No Aplica)";
            mouseSelect.appendChild(naOption); // Agregar opción N/A

            const assignedMouses = new Set(); // Para almacenar los IDs de mouses asignados

            const collaboratorsSnapshot = await getDocs(collection(db, "colaboradores"));
            collaboratorsSnapshot.forEach((collabDoc) => {
                const collabData = collabDoc.data();
                if (collabData.mouseId && collabData.mouseId !== "N/A") {
                    assignedMouses.add(collabData.mouseId); // Agregar ID a la lista de asignados
                }
            });

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!assignedMouses.has(doc.id)) { // Verificar si el mouse ya está asignado
                    const option = document.createElement("option");
                    option.value = doc.id; // ID del mouse
                    option.textContent = `${data.placa} - ${data.marca}`; // Mostrar placa y marca
                    mouseSelect.appendChild(option);
                }
            });
        }

        async function loadCelulares() {
            const querySnapshot = await getDocs(collection(db, "celulares"));
            const celularSelect = document.getElementById("celularSelect");
            celularSelect.innerHTML = ""; // Limpiar las opciones antes de cargar nuevos datos

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Seleccione un celular";
            celularSelect.appendChild(defaultOption);

            const naOption = document.createElement("option");
            naOption.value = "N/A";
            naOption.textContent = "N/A (No Aplica)";
            celularSelect.appendChild(naOption); // Agregar opción N/A

            const assignedCelulares = new Set(); // Para almacenar los IDs de mouses asignados

            const collaboratorsSnapshot = await getDocs(collection(db, "colaboradores"));
            collaboratorsSnapshot.forEach((collabDoc) => {
                const collabData = collabDoc.data();
                if (collabData.celularId && collabData.celularId !== "N/A") {
                    assignedCelulares.add(collabData.celularId); // Agregar ID a la lista de asignados
                }
            });

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!assignedCelulares.has(doc.id)) { // Verificar si el mouse ya está asignado
                    const option = document.createElement("option");
                    option.value = doc.id; // ID del mouse
                    option.textContent = `${data.placa} - ${data.marca} - ${data.modelo}`; // Mostrar placa y marca
                    celularSelect.appendChild(option);
                }
            });
        }

        async function loadBases() {
            const querySnapshot = await getDocs(collection(db, "bases"));
            const baseSelect = document.getElementById("baseSelect");
            baseSelect.innerHTML = ""; // Limpiar las opciones antes de cargar nuevos datos

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Seleccione un basepc";
            baseSelect.appendChild(defaultOption);

            const naOption = document.createElement("option");
            naOption.value = "N/A";
            naOption.textContent = "N/A (No Aplica)";
            baseSelect.appendChild(naOption); // Agregar opción N/A

            const assignedBases = new Set(); // Para almacenar los IDs de mouses asignados

            const collaboratorsSnapshot = await getDocs(collection(db, "colaboradores"));
            collaboratorsSnapshot.forEach((collabDoc) => {
                const collabData = collabDoc.data();
                if (collabData.baseId && collabData.baseId !== "N/A") {
                    assignedBases.add(collabData.baseId); // Agregar ID a la lista de asignados
                }
            });

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!assignedBases.has(doc.id)) { // Verificar si el mouse ya está asignado
                    const option = document.createElement("option");
                    option.value = doc.id; // ID del mouse
                    option.textContent = `${data.placa}`; // Mostrar placa y marca
                    baseSelect.appendChild(option);
                }
            });
        }

        async function loadPosapies() {
            const querySnapshot = await getDocs(collection(db, "posapies"));
            const posapiesSelect = document.getElementById("posapiesSelect");
            posapiesSelect.innerHTML = ""; // Limpiar las opciones antes de cargar nuevos datos

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Seleccione un basepc";
            posapiesSelect.appendChild(defaultOption);

            const naOption = document.createElement("option");
            naOption.value = "N/A";
            naOption.textContent = "N/A (No Aplica)";
            posapiesSelect.appendChild(naOption); // Agregar opción N/A

            const assignedPosapies = new Set(); // Para almacenar los IDs de mouses asignados

            const collaboratorsSnapshot = await getDocs(collection(db, "colaboradores"));
            collaboratorsSnapshot.forEach((collabDoc) => {
                const collabData = collabDoc.data();
                if (collabData.posapiesId && collabData.posapiesId !== "N/A") {
                    assignedPosapies.add(collabData.posapiesId); // Agregar ID a la lista de asignados
                }
            });

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!assignedPosapies.has(doc.id)) { // Verificar si el mouse ya está asignado
                    const option = document.createElement("option");
                    option.value = doc.id; // ID del mouse
                    option.textContent = `${data.placa}`; // Mostrar placa y marca
                    posapiesSelect.appendChild(option);
                }
            });
        }


        document.getElementById("collaboratorForm").onsubmit = async function(event) {

            event.preventDefault(); 

            const docId = document.getElementById("collaboratorId").value; // Obtener el ID del colaborador
            const fullName = document.getElementById("fullName").value;
            const idNumber = document.getElementById("idNumber").value;
            const area = document.getElementById("area").value;
            const computerId = document.getElementById("computerSelect").value; // Obtener el ID del computador seleccionado
            const keyboardId = document.getElementById("keyboardSelect").value; // Obtener el ID del teclado seleccionado
            const mouseId = document.getElementById("mouseSelect").value; // Obtener el ID del mouse seleccionado
            const celularId = document.getElementById("celularSelect").value; // Obtener el ID del mouse seleccionado
            const baseId = document.getElementById("baseSelect").value;
            const posapiesId = document.getElementById("posapiesSelect").value;

            if (docId) {
    // Actualizar el colaborador en Firestore
                await updateDoc(doc(db, "colaboradores", docId), {
                    nombre: fullName,
                    cedula: idNumber,
                    area: area,
                    computerId: computerId, // Guardar el ID del computador asignado
                    keyboardId: keyboardId, // Guardar el ID del teclado asignado
                    mouseId: mouseId, // Guardar el ID del mouse asignado
                    celularId: celularId, // Guardar el ID del celular asignado
                    baseId: baseId,
                    posapiesId: posapiesId // Guardar el ID de la base asignada
                });
            } else {
                // Agregar un nuevo colaborador
                await addDoc(collection(db, "colaboradores"), {
                    nombre: fullName,
                    cedula: idNumber,
                    area: area,
                    computerId: computerId, // Guardar el ID del computador asignado
                    keyboardId: keyboardId, // Guardar el ID del teclado asignado
                    mouseId: mouseId, // Guardar el ID del mouse asignado
                    celularId: celularId, // Guardar el ID del celular asignado
                    baseId: baseId, // Guardar el ID de la base asignada
                    posapiesId: posapiesId // Guardar el ID de la base asignada
                });
            }

            modal.style.display = "none"; // Cerrar el modal
            this.reset(); // Limpiar el formulario
            loadCollaborators(); // Recargar la tabla
            location.reload();
        }

        async function deleteCollaborator(docId) {
            if (confirm("¿Estás seguro de que deseas eliminar este colaborador?")) {
                try {
                    await deleteDoc(doc(db, "colaboradores", docId)); // Eliminar el documento en Firestore
                    alert("Colaborador eliminado correctamente.");
                    loadCollaborators(); // Recargar la lista de colaboradores
                } catch (error) {
                    console.error("Error al eliminar colaborador:", error);
                    alert("Hubo un error al eliminar el colaborador.");
                }
            }
        }

        function openEditModal(docId, data) {
            console.log(data)
    // Abrir el modal
            modal.style.display = "block";
            // Asignar el ID del colaborador al campo oculto
            document.getElementById("collaboratorId").value = docId;
            // Rellenar los campos del formulario con la información del colaborador
            document.getElementById("fullName").value = data.nombre || "";
            document.getElementById("idNumber").value = data.cedula || "";
            document.getElementById("area").value = data.area || "";
            
            // Asignar los IDs de los activos a los selectores
            console.log("ID del computador:", data.computerId);
            document.getElementById("computerSelect").value = data.computerId || ""; 

            document.getElementById("keyboardSelect").value = data.keyboardId || ""; 
            document.getElementById("mouseSelect").value = data.mouseId || ""; 
            document.getElementById("celularSelect").value = data.celularId || "";
            document.getElementById("baseSelect").value = data.baseId || ""; 
            document.getElementById("posapiesSelect").value = data.posapiesId || ""; 
        }

        window.openEditModal = openEditModal;

        window.onload = function() {
            loadCollaborators(); 
            loadComputers(); 
            loadKeyboards(); 
            loadMouses(); 
            loadCelulares();
            loadBases();
            loadPosapies(); 
        }

        var modal = document.getElementById("myModal");
        var btn = document.querySelector(".floating-button");
        var close = document.getElementById("closex");

        btn.onclick = function() {
            modal.style.display = "block";
            // Limpiar los campos del formulario al abrir el modal
            document.getElementById("collaboratorId").value = ""; // Limpiar el ID al abrir el modal
            document.getElementById("fullName").value = ""; // Limpiar el nombre
            document.getElementById("idNumber").value = ""; // Limpiar la cédula
            document.getElementById("area").value = ""; // Limpiar el área
            document.getElementById("computerSelect").value = ""; // Limpiar el computador seleccionado
            document.getElementById("keyboardSelect").value = ""; // Limpiar el teclado seleccionado
            document.getElementById("mouseSelect").value = ""; // Limpiar el mouse seleccionado
            document.getElementById("celularSelect").value = "";
            document.getElementById("baseSelect").value = "";
            document.getElementById("posapiesSelect").value = "";
        }

        close.onclick = function() {
            modal.style.display = "none";
            // Limpiar los campos del formulario al cerrar el modal
            document.getElementById("collaboratorId").value = ""; // Limpiar el ID al cerrar el modal
            document.getElementById("fullName").value = ""; // Limpiar el nombre
            document.getElementById("idNumber").value = ""; // Limpiar la cédula
            document.getElementById("area").value = ""; // Limpiar el área
            document.getElementById("computerSelect").value = ""; // Limpiar el computador seleccionado
            document.getElementById("keyboardSelect").value = ""; // Limpiar el teclado seleccionado
            document.getElementById("mouseSelect").value = ""; // Limpiar el mouse seleccionado
            document.getElementById("celularSelect").value = "";
            document.getElementById("baseSelect").value = "";
            document.getElementById("posapiesSelect").value = "";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                // Limpiar los campos del formulario al cerrar el modal
                document.getElementById("collaboratorId").value = ""; // Limpiar el ID al cerrar el modal
                document.getElementById("fullName").value = ""; // Limpiar el nombre
                document.getElementById("idNumber").value = ""; // Limpiar la cédula
                document.getElementById("area").value = ""; // Limpiar el área
                document.getElementById("computerSelect").value = ""; // Limpiar el computador seleccionado
                document.getElementById("keyboardSelect").value = ""; // Limpiar el teclado seleccionado
                document.getElementById("mouseSelect").value = ""; // Limpiar el mouse seleccionado
                document.getElementById("celularSelect").value = "";
                document.getElementById("baseSelect").value = "";
                document.getElementById("posapiesSelect").value = "";
            }
        }
