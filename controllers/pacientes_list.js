


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
    // Captura del token de la sesión
    let token = sessionStorage.getItem('token_hospital_gest');

    // Preparación de los datos del formulario
    let formData = new FormData(document.getElementById('filtroForm'));
    let filtros = {};
    formData.forEach((value, key) => { filtros[key] = value; });

   // console.log(filtros); // Imprimir filtros para depuración

    // Solicitud Fetch al servidor
    fetch('./wspacientes.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token  // Token real aquí
        },
        body: JSON.stringify(filtrarYPrepararDatos(filtros))
    })
    .then(response => {
        if (response.headers.get("content-type").includes("application/json")) {
            return response.json();
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .then(data => {
        console.log(data); // Imprimir para depuración
        mostrarPacientes(data);
    })
    .catch(error => console.error('Error:', error));
}




// esta función elimina los filtros sin valor para la consulta

function filtrarYPrepararDatos(objetoFiltros) {
    let filtrosConValor = {};

    for (const key in objetoFiltros) {
        if (objetoFiltros[key] !== "") {
            filtrosConValor[key] = objetoFiltros[key];
        }
    }

    return filtrosConValor;
}


function mostrarPacientes(respuesta) {
    const contenedor = document.getElementById('lista_pacientes');
    contenedor.innerHTML = ''; // Limpiar el contenedor actual

    // comprobamos que viene array
    if (respuesta && Array.isArray(respuesta.data)) {
        const pacienteDiv = document.createElement('div');
        pacienteDiv.classList.add('row', 'mb-3'); 
        const pacienteColumn = document.createElement('div');
          
            pacienteColumn.classList.add('col');
            pacienteDiv.appendChild(pacienteColumn);

        respuesta.data.forEach(paciente => {
            const pacienteBloq = document.createElement('span')
            pacienteBloq.classList.add('d-block');
            
           
            const pacienteDetails = document.createElement('p');
            pacienteDetails.innerHTML = `${paciente.sip}        ${paciente.dni}           ${paciente.nombre}          ${paciente.apellido1}`;

            pacienteColumn.appendChild(pacienteDetails);
            contenedor.appendChild(pacienteDiv);
            contenedor.appendChild(pacienteBloq);

        });

        
    } else {
        console.error('Se esperaba un objeto con una propiedad "data" que es un array, pero se recibió:', respuesta);
        contenedor.innerText = 'No se pudieron cargar los datos de los pacientes.';
    }
}