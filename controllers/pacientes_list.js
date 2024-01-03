


/**
 *   ABF 2023
 *  controlador de pacientes_list.html
 * 
 */


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filtroForm').addEventListener('submit', (event) => {
        event.preventDefault();
        mostrarToken();
        realizarBusqueda();
    });
});


function mostrarToken() {
    let token = sessionStorage.getItem('token_hospital_gest');
    if (token) {
        document.getElementById('lista_pacientes').innerText = "Token: " + token;
    } else {
        document.getElementById('lista_pacientes').innerText = "No hay token disponible.";
    }
}



function realizarBusqueda() {

    // capturamos el token de la session
    let token = sessionStorage.getItem('token_hospital_gest');

    let formData = new FormData(document.getElementById('filtroForm'));
    let data = {};
    formData.forEach((value, key) => { data[key] = value; });


      

    fetch('./wspacientes.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token  //  token real aquí
        },

        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            mostrarPacientes(data);
        })


}

function mostrarPacientes(pacientes) {
    const lista = document.getElementById('lista_pacientes');
    lista.innerHTML = ''; // Limpiar la lista actual

    pacientes.forEach(paciente => {
        // Crear el contenedor principal para cada paciente
        const pacienteDiv = document.createElement('div');
        pacienteDiv.classList.add('d-flex', 'text-body-secondary', 'pt-3');

        // Crear el contenedor del contenido
        const contenidoDiv = document.createElement('div');
        contenidoDiv.classList.add('pb-3', 'mb-0', 'small', 'lh-sm', 'border-bottom', 'w-100');

        // Crear y añadir el texto con los detalles del paciente
        const detalles = `SIP: ${paciente.sip}, DNI: ${paciente.dni}, Nombre: ${paciente.nombre}, Apellido: ${paciente.apellido1}`;
        contenidoDiv.innerText = detalles;

        // Añadir el contenido al contenedor principal
        pacienteDiv.appendChild(contenidoDiv);

        // Añadir el contenedor principal a la lista
        lista.appendChild(pacienteDiv);
    });
}


