// script.js

function filterTable() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toLowerCase();
    const tableBody = document.querySelector("tbody");
    const rows = tableBody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let rowContainsFilter = false;

        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if (cell) {
                const textValue = cell.textContent || cell.innerText;
                if (textValue.toLowerCase().indexOf(filter) > -1) {
                    rowContainsFilter = true;
                    break;
                }
            }
        }

        rows[i].style.display = rowContainsFilter ? "" : "none"; // Mostrar u ocultar la fila
    }
}