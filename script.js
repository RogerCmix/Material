// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getDatabase, ref, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

// Configuración de Firebase (la que me proporcionaste)
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
const database = getDatabase(app); // Obtener la referencia a la base de datos
const materialsRef = ref(database, 'materiales'); // Referencia a la tabla "materiales"

// Referencias a elementos del DOM
const materialForm = document.getElementById('materialForm');
const materialsTableBody = document.querySelector('#materialsTable tbody');

// Función para cargar materiales desde Firebase
function loadMaterials() {
    materialsTableBody.innerHTML = ''; // Limpiar la tabla antes de cargar nuevos datos
    onValue(materialsRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const material = childSnapshot.val();
            const row = `
                <tr>
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
                        <button onclick="editMaterial('${childSnapshot.key}')">Editar</button>
                        <button onclick="deleteMaterial('${childSnapshot.key}')">Eliminar</button>
                    </td>
                </tr>
            `;
            materialsTableBody.innerHTML += row; // Agregar cada fila a la tabla
        });
    });
}

// Función para guardar un material
materialForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevenir el envío predeterminado del formulario

    // Obtener los valores del formulario
    const id = materialForm.id.value;
    const material = {
        descripcion: materialForm.descripcion.value,
        fabricante: materialForm.fabricante.value,
        referencia: materialForm.referencia.value,
        tarifaVenta: parseFloat(materialForm.tarifaVenta.value),
        dtoVenta: parseFloat(materialForm.dtoVenta.value),
        tarifaProv: parseFloat(materialForm.tarifaProv.value),
        dtoProv: parseFloat(materialForm.dtoProv.value),
        precioNeto: parseFloat(materialForm.precioNeto.value),
        fechaActualizacion: materialForm.fechaActualizacion.value,
        notas: materialForm.notas.value
    };

    // Si hay un ID, actualizar el material existente; de lo contrario, crear uno nuevo
    if (id) {
        update(ref(database, `materiales/${id}`), material); // Actualizar material existente
    } else {
        push(materialsRef, material); // Crear un nuevo material
    }

    materialForm.reset(); // Limpiar el formulario
    loadMaterials(); // Recargar la lista de materiales
});

// Función para editar un material
function editMaterial(id) {
    // Obtener el material por su ID
    get(ref(database, `materiales/${id}`)).then((snapshot) => {
        if (snapshot.exists()) {
            const material = snapshot.val();
            materialForm.id.value = id; // Asignar el ID al campo oculto
            materialForm.descripcion.value = material.descripcion;
            materialForm.fabricante.value = material.fabricante;
            materialForm.referencia.value = material.referencia;
            materialForm.tarifaVenta.value = material.tarifaVenta;
            materialForm.dtoVenta.value = material.dtoVenta;
            materialForm.tarifaProv.value = material.tarifaProv;
            materialForm.dtoProv.value = material.dtoProv;
            materialForm.precioNeto.value = material.precioNeto;
            materialForm.fechaActualizacion.value = material.fechaActualizacion;
            materialForm.notas.value = material.notas;
        }
    });
}

// Función para eliminar un material
function deleteMaterial(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este material?')) {
        remove(ref(database, `materiales/${id}`)); // Eliminar el material por su ID
        loadMaterials(); // Recargar la lista de materiales
    }
}

// Cargar materiales al iniciar la aplicación
loadMaterials();
