import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js"; // Importa Timestamp
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
const auth = getAuth(app);
const analytics = getAnalytics(app);
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
            // Cargar los préstamos
            await loadPrestamos();

            if (userData.role === "viewer") {
                // Ocultar botones de crear, editar y eliminar
                document.querySelector('.form-container').style.display = 'none'; // Ocultar el contenedor del formulario


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

window.onload = async function() {
    await loadAvailableEquipments(); // Cargar equipos disponibles primero
    await loadPrestamos(); // Luego cargar los préstamos
};

async function loadAvailableEquipments(currentLoanEquipments = []) {
    const equipmentSelect = document.getElementById("equipmentSelect");
    equipmentSelect.innerHTML = ""; // Limpiar las opciones

    // Obtener los equipos ya asignados (en préstamos activos: estado distinto de "entregado")
    const prestamosSnapshot = await getDocs(collection(db, "prestamos"));
    let unavailableEquipments = new Set();
    prestamosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.estado !== "entregado") {
            // Agregar cada equipo asignado a este préstamo
            data.equipos.forEach(equipId => {
                unavailableEquipments.add(equipId);
            });
        }
    });

    // Cargar cada categoría de equipos, pasando el set de no disponibles
    await loadComputers(equipmentSelect, unavailableEquipments, currentLoanEquipments);
    await loadKeyboards(equipmentSelect, unavailableEquipments, currentLoanEquipments);
    await loadMouses(equipmentSelect, unavailableEquipments, currentLoanEquipments);
    await loadCelulares(equipmentSelect, unavailableEquipments, currentLoanEquipments);
    await loadPosapies(equipmentSelect, unavailableEquipments, currentLoanEquipments);
}

async function loadPrestamos() {
    const querySnapshot = await getDocs(collection(db, "prestamos"));
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos
  
    const today = new Date(); // Obtener la fecha actual

    for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const equiposPlacas = data.equipos.map(equipId => 
            equipmentsPlacasMapping[equipId] ? equipmentsPlacasMapping[equipId] : equipId
        ).join(", ");

        // Verificar si la fecha de devolución ha pasado y el estado es "pendiente"
        let fechaDevolucion;
        if (data.fechaDevolucion) {
            // Verificar si es un Timestamp
            if (data.fechaDevolucion instanceof Timestamp) {
                fechaDevolucion = data.fechaDevolucion.toDate(); // Convertir a objeto Date
            } else {
                // Intentar convertir de cadena a objeto Date
                fechaDevolucion = new Date(data.fechaDevolucion);
                if (isNaN(fechaDevolucion.getTime())) {
                    console.error("Fecha de devolución no válida:", data.fechaDevolucion);
                    fechaDevolucion = null; // Establecer a null si no es válida
                }
            }

            if (data.estado === "pendiente" && fechaDevolucion && fechaDevolucion < today) {
                // Actualizar el estado a "vencido"
                await updateDoc(doc.ref, { estado: "vencido" });
                data.estado = "vencido"; // Actualizar el estado en la variable local para mostrar en la tabla
            }
        }

        const row = `
            <tr>
                <td>${data.fechaPrestamo.toDate().toLocaleDateString()}</td>
                <td>${data.nombre}</td>
                <td>${data.cedula}</td>
                <td>${data.cargo}</td>
                <td>${equiposPlacas}</td>
                <td>${fechaDevolucion ? fechaDevolucion.toLocaleDateString() : ''}</td>
                <td class="estado ${data.estado}">${data.estado}</td> 
                <td>
                    <div class="icons">
                        <a href="#" class="action-icon edit" title="Editar" onclick='openEditModal("${doc.id}", ${JSON.stringify(data).replace(/"/g, "&quot;")})'>
                            <i class="bx bx-edit"></i>
                        </a>
                        <a href="#" class="action-icon delete" title="Eliminar" data-id="${doc.id}">
                            <i class="bx bx-trash"></i>
                        </a>
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    }

    // Agregar evento de clic a los enlaces de eliminación
    const deleteButtons = document.querySelectorAll('.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const docId = this.getAttribute('data-id');
            deletePrestamo(docId);
        });
    });
}
  

  document.getElementById("prestamoForm").onsubmit = async function(event) {
    event.preventDefault(); 

    const prestamoId = document.getElementById("prestamoId").value; 
    const fullName = document.getElementById("fullName").value;
    const idNumber = document.getElementById("idNumber").value;
    const jobTitle = document.getElementById("jobTitle").value;

    // Obtener los IDs de los equipos seleccionados
    const equipmentIds = Array.from(document.getElementById("equipmentSelect").selectedOptions).map(option => option.value);
    
    const returnDateInput = document.getElementById("returnDate").value; // Obtener la fecha de devolución como string
    const returnDate = new Date(returnDateInput); // Convertir a objeto Date
    const today = new Date(); // Fecha actual
    today.setHours(0, 0, 0, 0); // Establecer la hora a 00:00:00 para la comparación

    // Validar que la fecha de devolución no sea menor a la fecha actual
    if (returnDate < today) {
        alert("La fecha de devolución no puede ser menor a la fecha actual.");
        return; // Salir de la función si la validación falla
    }

    const status = document.getElementById("status").value;

    if (prestamoId) {
        // Actualizar el préstamo existente
        await updateDoc(doc(db, "prestamos", prestamoId), {
            nombre: fullName,
            cedula: idNumber,
            cargo: jobTitle,
            equipos: equipmentIds, // Guardar como array
            fechaDevolucion: returnDate,
            estado: status
        });
    } else {
        // Agregar un nuevo préstamo
        await addDoc(collection(db, "prestamos"), {
            fechaPrestamo: new Date(),
            nombre: fullName,
            cedula: idNumber,
            cargo: jobTitle,
            equipos: equipmentIds, // Guardar como array
            fechaDevolucion: returnDate,
            estado: status
        });
    }

    this.reset(); // Limpiar el formulario
    loadPrestamos(); // Recargar la tabla
};

async function deletePrestamo(docId) {
    if (confirm("¿Estás seguro de que deseas eliminar este préstamo?")) {
        try {
            await deleteDoc(doc(db, "prestamos", docId)); // Eliminar el documento en Firestore
            alert("Préstamo eliminado correctamente.");
            window.location.reload(); // Recargar la página
        } catch (error) {
            console.error("Error al eliminar préstamo:", error);
            alert("Hubo un error al eliminar el préstamo.");
        }
    }
}

  
  // Si se abre el modal para editar, recargamos el select incluyendo los equipos ya asignados al préstamo:
  async function openEditModal(docId, data) {
    document.getElementById("prestamoId").value = docId;
    document.getElementById("fullName").value = data.nombre || "";
    document.getElementById("idNumber").value = data.cedula || "";
    document.getElementById("jobTitle").value = data.cargo || "";

    // Manejo de la fecha de devolución
    let fechaDevolucion;
    if (data.fechaDevolucion) {
        // Verificar si es un Timestamp
        if (data.fechaDevolucion instanceof Timestamp) {
            fechaDevolucion = data.fechaDevolucion.toDate(); // Convertir a objeto Date
        } else {
            // Intentar convertir de cadena a objeto Date
            fechaDevolucion = new Date(data.fechaDevolucion);
        }
    }

    // Verificar si la fecha de devolución es válida
    if (fechaDevolucion && !isNaN(fechaDevolucion.getTime())) {
        document.getElementById("returnDate").value = fechaDevolucion.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    } else {
        console.error("Fecha de devolución no válida:", data.fechaDevolucion);
        document.getElementById("returnDate").value = ""; // Limpiar el campo si no es válida
    }

    document.getElementById("status").value = data.estado || "";

    // Cargar el select de equipos disponibles, permitiendo incluir los que ya se asignaron en este préstamo
    await loadAvailableEquipments(data.equipos || []);
    
    // Marcar los equipos asignados previamente en el select
    const equipmentSelect = document.getElementById("equipmentSelect");
    for (let option of equipmentSelect.options) {
        option.selected = data.equipos && data.equipos.includes(option.value);
    }
    
    // Si utilizas el contenedor para mostrar los equipos seleccionados, actualízalo:
    const selectedOptions = Array.from(equipmentSelect.selectedOptions)
                                .map(option => option.textContent)
                                .filter(text => text.trim() !== "Seleccione un equipo");
    document.getElementById("selectedEquipments").textContent = 
        "Equipos seleccionados: " + (selectedOptions.length ? selectedOptions.join(", ") : "Ninguno");
}

  window.openEditModal = openEditModal;




  document.getElementById("clearButton").addEventListener("click", function() {
    // Limpiar el formulario
    document.getElementById("prestamoForm").reset(); // Restablecer todos los campos del formulario

    // Opcional: Si deseas limpiar también el select de equipos
    const equipmentSelect = document.getElementById("equipmentSelect");
    for (let option of equipmentSelect.options) {
        option.selected = false; // Limpiar selección de equipos
    }
    
    // Limpiar el contenedor de equipos seleccionados
    document.getElementById("selectedEquipments").textContent = "Equipos seleccionados: Ninguno";
});

document.getElementById("equipmentSearch").addEventListener("keyup", function() {
    const filter = this.value.toLowerCase();
    const equipmentSelect = document.getElementById("equipmentSelect");
  
    // Recorrer todas las opciones y mostrar/ocultar según el texto
    for (let option of equipmentSelect.options) {
      const text = option.textContent.toLowerCase();
      option.style.display = text.includes(filter) ? "" : "none";
    }
  });
  


let equipmentsPlacasMapping = {};

async function loadComputers(selectElement, unavailableEquipments, currentLoanEquipments) {
    const querySnapshot = await getDocs(collection(db, "computadores"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Actualiza el mapeo sin importar la disponibilidad
      equipmentsPlacasMapping[doc.id] = data.placa;
      // Si el equipo está en uso y no forma parte de los equipos del préstamo en edición, se omite en el select
      if (unavailableEquipments.has(doc.id) && !currentLoanEquipments.includes(doc.id)) return;
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${data.marca} - ${data.placa} (${data.tipo})`;
      selectElement.appendChild(option);
    });
  }
  
  async function loadKeyboards(selectElement, unavailableEquipments, currentLoanEquipments) {
    const querySnapshot = await getDocs(collection(db, "teclados"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Actualiza el mapeo siempre
      equipmentsPlacasMapping[doc.id] = data.placa;
      if (unavailableEquipments.has(doc.id) && !currentLoanEquipments.includes(doc.id)) return;
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${data.marca} - ${data.placa} (${data.tipo})`;
      selectElement.appendChild(option);
    });
  }
  
  async function loadMouses(selectElement, unavailableEquipments, currentLoanEquipments) {
    const querySnapshot = await getDocs(collection(db, "mouses"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      equipmentsPlacasMapping[doc.id] = data.placa;
      if (unavailableEquipments.has(doc.id) && !currentLoanEquipments.includes(doc.id)) return;
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${data.marca} - ${data.placa} (${data.tipo})`;
      selectElement.appendChild(option);
    });
  }
  
  async function loadCelulares(selectElement, unavailableEquipments, currentLoanEquipments) {
    const querySnapshot = await getDocs(collection(db, "celulares"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      equipmentsPlacasMapping[doc.id] = data.placa;
      if (unavailableEquipments.has(doc.id) && !currentLoanEquipments.includes(doc.id)) return;
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${data.marca} - ${data.modelo} - ${data.placa}`;
      selectElement.appendChild(option);
    });
  }
  
  async function loadPosapies(selectElement, unavailableEquipments, currentLoanEquipments) {
    const querySnapshot = await getDocs(collection(db, "posapies"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      equipmentsPlacasMapping[doc.id] = data.placa;
      if (unavailableEquipments.has(doc.id) && !currentLoanEquipments.includes(doc.id)) return;
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${data.placa} - Posa Pies`;
      selectElement.appendChild(option);
    });
  }
  


document.getElementById("equipmentSelect").addEventListener("change", function() {
    // Obtener los textos de las opciones seleccionadas
    const selectedOptions = Array.from(this.selectedOptions)
                                .map(option => option.textContent)
                                .filter(text => text.trim() !== "Seleccione un equipo");
    
    // Actualizar el contenedor con la lista de equipos seleccionados
    // Actualizar el contenedor con la lista de equipos seleccionados
    const displayText = selectedOptions.length 
                        ? selectedOptions.join(", ") 
                        : "Ninguno";

    document.getElementById("selectedEquipments").textContent = "Equipos seleccionados: " + displayText;
  });
  
