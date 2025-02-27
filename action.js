        async function logAction(action) {
            const now = new Date(); // Obtener la fecha y hora actual
            const fecha = now.toLocaleDateString(); // Obtener la fecha
            const hora = now.toLocaleTimeString(); // Obtener la hora
        
            const historialRef = collection(db, "historial"); // Referencia a la colección de historial
        
            try {
                await addDoc(historialRef, {
                    fecha: fecha,
                    hora: hora, // Agregar la hora al documento
                    accion: action
                });
                console.log("Acción registrada en el historial:", action);
            } catch (error) {
                console.error("Error al registrar la acción en el historial:", error);
            }
        }