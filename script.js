// Configuración de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    databaseURL: "TU_DATABASE_URL",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const materialsRef = database.ref('materiales');

// Referencias a elementos del DOM
const materialForm = document.getElementById('materialForm');
const materialsTableBody = document.querySelector('#materialsTable tbody');

// Función para cargar materiales desde Firebase
function loadMaterials() {
    materialsTableBody.innerHTML = '';
    materialsRef.on('value', (snapshot) => {
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
            materialsTableBody.innerHTML += row;
        });
    });
}

// Función para guardar un material
materialForm.addEventListener('submit', (e) => {
    e.preventDefault();
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

    if (id) {
        materialsRef.child(id).update(material);
    } else {
        materialsRef.push(material);
    }

    materialForm.reset();
    loadMaterials();
});

// Función para editar un material
function editMaterial(id) {
    materialsRef.child(id).once('value', (snapshot) => {
        const material = snapshot.val();
        materialForm.id.value = id;
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
    });
}

// Función para eliminar un material
function deleteMaterial(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este material?')) {
        materialsRef.child(id).remove();
        loadMaterials();
    }
}

// Cargar materiales al iniciar la aplicación
loadMaterials();
