// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDVptkRdKOd0mMeFqi9FbQrjo4z14bbJ-o",
    authDomain: "gestionmateriales-20935.firebaseapp.com",
    databaseURL: "https://gestionmateriales-20935-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "gestionmateriales-20935",
    storageBucket: "gestionmateriales-20935.firebasestorage.app",
    messagingSenderId: "789245531508",
    appId: "1:789245531508:web:1337d6697ab366bdb54821"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const materialsRef = ref(database, 'materiales');

// Referencias a elementos del DOM
const materialsTableBody = document.querySelector('#materialsTable tbody');
const searchInput = document.getElementById('searchInput');
const materialForm = document.getElementById('materialForm');

// Función para cargar todos los materiales desde Firebase
let allMaterials = [];
function loadMaterials() {
    console.log("Cargando materiales desde Firebase...");
    materialsTableBody.innerHTML = ''; // Limpiar la tabla antes de cargar nuevos datos
    onValue(materialsRef, (snapshot) => {
        allMaterials = [];
        snapshot.forEach((childSnapshot) => {
            const material = childSnapshot.val();
            material.id = childSnapshot.key; // Agregar el ID del material
            allMaterials.push(material);
        });
        console.log("Materiales cargados:", allMaterials);
        renderMaterials(); // Renderizar los materiales en la tabla
    }, (error) => {
        console.error("Error al cargar materiales:", error);
    });
}

// Función para renderizar los materiales en la tabla
function renderMaterials() {
    console.log("Renderizando materiales en la tabla...");
    materialsTableBody.innerHTML = ''; // Limpiar la tabla antes de mostrar resultados

    allMaterials.forEach((material) => {
        const row = `
            <tr data-id="${material.id}">
                <td>${material.descripcion}</td>
                <td>${material.fabricante}</td>
                <td>${material.referencia}</td>
                <td>${material.tarifaVenta.toFixed(2)}</td>
                <td>${material.dtoVenta}%</td>
                <td>${material.tarifaProv.toFixed(2)}</td>
                <td>${material.dtoProv}%</td>
                <td>${material.precioNeto.toFixed(2)}</td>
                <td>${material.fechaActualizacion}</td>
                <td>
                    <button class="edit-btn">Editar</button>
                    <button class="delete-btn">Eliminar</button>
                </td>
            </tr>
        `;
        materialsTableBody.innerHTML += row; // Agregar cada fila a la tabla
    });

    // Adjuntar eventos delegados
    materialsTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const row = target.closest('tr'); // Obtener la fila padre
        if (!row) return;

        const id = row.getAttribute('data-id'); // Obtener el ID del material
        if (target.classList.contains('edit-btn')) {
            editMaterial(id); // Llamar a la función de edición
        } else if (target.classList.contains('delete-btn')) {
            deleteMaterial(id); // Llamar a la función de eliminación
        }
    });
}

// Función para filtrar materiales
function filterMaterials() {
    const query = searchInput.value.toLowerCase();
    materialsTableBody.innerHTML = ''; // Limpiar la tabla antes de mostrar resultados

    allMaterials.forEach((material) => {
        const values = Object.values(material).join(' ').toLowerCase(); // Unir todos los campos
        if (values.includes(query)) {
            const row = `
                <tr data-id="${material.id}">
                    <td>${material.descripcion}</td>
                    <td>${material.fabricante}</td>
                    <td>${material.referencia}</td>
                    <td>${material.tarifaVenta.toFixed(2)}</td>
                    <td>${material.dtoVenta}%</td>
                    <td>${material.tarifaProv.toFixed(2)}</td>
                    <td>${material.dtoProv}%</td>
                    <td>${material.precioNeto.toFixed(2)}</td>
                    <td>${material.fechaActualizacion}</td>
                    <td>
                        <button class="edit-btn">Editar</button>
                        <button class="delete-btn">Eliminar</button>
                    </td>
                </tr>
            `;
            materialsTableBody.innerHTML += row; // Agregar cada fila a la tabla
        }
    });

    // Adjuntar eventos delegados después de filtrar
    materialsTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const row = target.closest('tr'); // Obtener la fila padre
        if (!row) return;

        const id = row.getAttribute('data-id'); // Obtener el ID del material
        if (target.classList.contains('edit-btn')) {
            editMaterial(id); // Llamar a la función de edición
        } else if (target.classList.contains('delete-btn')) {
            deleteMaterial(id); // Llamar a la función de eliminación
        }
    });
}

// Función para guardar un material
materialForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevenir el envío predeterminado del formulario

    // Obtener los valores del formulario
    const id = materialForm.id.value;
    const tarifaProv = parseFloat(materialForm.tarifaProv.value);
    const dtoProv = parseFloat(materialForm.dtoProv.value);

    // Calcular valores derivados
    const precioNeto = tarifaProv - (tarifaProv * (dtoProv / 100));
    const dtoVenta = Math.max(dtoProv, 45); // DTO Venta es el máximo entre DTO Proveedor y 45
    const tarifaVenta = precioNeto + (precioNeto * (dtoVenta / 100));

    const material = {
        descripcion: materialForm.descripcion.value,
        fabricante: materialForm.fabricante.value,
        referencia: materialForm.referencia.value,
        tarifaVenta: tarifaVenta,
        dtoVenta: dtoVenta,
        tarifaProv: tarifaProv,
        dtoProv: dtoProv,
        precioNeto: precioNeto,
        fechaActualizacion: materialForm.fechaActualizacion.value,
        notas: materialForm.notas.value
    };

    console.log("Guardando material:", material);

    // Si hay un ID, actualizar el material existente; de lo contrario, crear uno nuevo
    if (id) {
        update(ref(database, `materiales/${id}`), material) // Actualizar material existente
            .then(() => {
                console.log("Material actualizado correctamente.");
                materialForm.reset(); // Limpiar el formulario
                loadMaterials(); // Recargar la lista de materiales
            })
            .catch((error) => console.error('Error al actualizar:', error));
    } else {
        push(materialsRef, material) // Crear un nuevo material
            .then(() => {
                console.log("Material guardado correctamente.");
                materialForm.reset(); // Limpiar el formulario
                loadMaterials(); // Recargar la lista de materiales
            })
            .catch((error) => console.error('Error al guardar:', error));
    }
});

// Función para editar un material
function editMaterial(id) {
    console.log("Editando material con ID:", id);
    get(ref(database, `materiales/${id}`)).then((snapshot) => {
        if (snapshot.exists()) {
            const material = snapshot.val();
            materialForm.id.value = id; // Asignar el ID al campo oculto
            materialForm.descripcion.value = material.descripcion;
            materialForm.fabricante.value = material.fabricante;
            materialForm.referencia.value = material.referencia;
            materialForm.tarifaProv.value = material.tarifaProv;
            materialForm.dtoProv.value = material.dtoProv;
            materialForm.fechaActualizacion.value = material.fechaActualizacion;
            materialForm.notas.value = material.notas;
        } else {
            console.error("No se encontró el material con ID:", id);
        }
    }).catch((error) => console.error('Error al cargar material:', error));
}

// Función para eliminar un material
function deleteMaterial(id) {
    console.log("Eliminando material con ID:", id);
    if (confirm('¿Estás seguro de que deseas eliminar este material?')) {
        remove(ref(database, `materiales/${id}`)) // Eliminar el material por su ID
            .then(() => {
                console.log("Material eliminado correctamente.");
                loadMaterials(); // Recargar la lista de materiales
            })
            .catch((error) => console.error('Error al eliminar:', error));
    }
}

// Cargar materiales al iniciar la aplicación
loadMaterials();
