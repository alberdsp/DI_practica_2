


/**
 *   ABF 2023
 *  controlador de pacientes_list.html
 * 
 */


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filtroForm').addEventListener('submit', (event) => {
        event.preventDefault();

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


// función para buscar paciente por dni
function buscarPaciente(dni) {
    // Captura del token de la sesión
    let token = sessionStorage.getItem('token_hospital_gest');

    // Solicitud Fetch al servidor

    fetch('./wspacientes.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token  // Token real aquí
        },
        body: JSON.stringify({ dni: dni })
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

    // Crear la tabla
    const tabla = document.createElement('table');
    tabla.classList.add('table');

    if (respuesta && Array.isArray(respuesta.data)) {
        respuesta.data.forEach(paciente => {
            // Crear una fila para cada paciente
            const fila = document.createElement('tr');

            // Crear y añadir celdas para los detalles del paciente
            fila.appendChild(crearCelda(paciente.sip));
            fila.appendChild(crearCelda(paciente.dni));
            fila.appendChild(crearCelda(paciente.nombre));
            fila.appendChild(crearCelda(paciente.apellido1));

            // Crear celda para los botones
            const celdaBotones = document.createElement('td');

            /// Botón de editar
            const botonEditar = document.createElement('button');
            botonEditar.innerText = 'Editar';
            botonEditar.classList.add('btn', 'btn-primary', 'mr-2');
            botonEditar.setAttribute('data-dni', paciente.dni);
            botonEditar.onclick = function () {
                editarPaciente(this.getAttribute('data-dni'));
            };

            celdaBotones.appendChild(botonEditar);


            // Botón de borrar
            const botonBorrar = document.createElement('button');
            botonBorrar.innerText = 'Borrar';
            botonBorrar.classList.add('btn', 'btn-danger', 'mr-2');
            botonBorrar.setAttribute('data-dni', paciente.dni);
            botonBorrar.onclick = function () {
                borrarPaciente(this.getAttribute('data-dni'));
            };


            celdaBotones.appendChild(botonBorrar);

            // Añadir la celda de botones a la fila
            fila.appendChild(celdaBotones);

            // Añadir la fila a la tabla con un margen adicional
            fila.classList.add('fila-paciente');

            // Añadir la fila a la tabla
            tabla.appendChild(fila);
        });
        // Añadir la tabla al contenedor
        contenedor.appendChild(tabla);
    } else {
        console.error('Se esperaba un objeto con una propiedad "data" que es un array, pero se recibió:', respuesta);
        contenedor.innerText = 'No se pudieron cargar los datos de los pacientes.';
    }
}

function crearCelda(texto) {
    const celda = document.createElement('td');
    celda.textContent = texto;
    return celda;
}

function crearBoton(texto, clases, onClick) {
    const boton = document.createElement('button');
    boton.textContent = texto;
    boton.classList.add('btn', clases, 'mr-2'); // Añadido margen derecho
    boton.onclick = onClick;
    return boton;
}

function editarPaciente(dni) {
    let token = sessionStorage.getItem('token_hospital_gest');

    fetch('wspacientes.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ dni: dni })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            console.log('Paciente EDITADO:', data);

            // Rellenamos el formulario con los datos del paciente
            document.getElementById('sip').value = data.data[0]['sip'];
            document.getElementById('dni').value = data.data[0]['dni'];
            document.getElementById('nombre').value = data.data[0]['nombre'];
            document.getElementById('apellido1').value = data.data[0]['apellido1'];

            // botón de guardar
            let botonGuardar = document.createElement('button');
            botonGuardar.id = 'botonGuardar'; // Assign the ID
            botonGuardar.innerText = 'Guardar';
            botonGuardar.classList.add('btn', 'btn-primary', 'mr-2');
            botonGuardar.onclick = function () {
                let sip = document.getElementById('sip').value;
                let dni = document.getElementById('dni').value;
                let nombre = document.getElementById('nombre').value;
                let apellido1 = document.getElementById('apellido1').value;
                guardarPaciente(dni, sip, nombre, apellido1);
            };

            // botón de cancelar
            let botonCancelar = document.createElement('button');
            botonCancelar.id = 'botonCancelar'; // Assign the ID
            botonCancelar.innerText = 'Cancelar';
            botonCancelar.classList.add('btn', 'btn-primary', 'mr-2');
            botonCancelar.onclick = function () {
                document.getElementById('filtroForm').reset();
                realizarBusqueda();
            };

            // si el formulario no contiene el boton de guardar 
            let botonGuardarActual = document.getElementById('botonGuardar');
            let botonCancelarActual = document.getElementById('botonCancelar');
            if (!(botonGuardarActual && botonCancelarActual)) {
                // añadimos el boton de guardar al formulario
                document.getElementById('filtroForm').appendChild(botonGuardar);
                // añadimos el boton de cancelar al formulario
                document.getElementById('filtroForm').appendChild(botonCancelar);
            }

        })
        .catch(error => {
            console.error('Error al editar paciente:', error);
        });
}

// Guardar paciente
function guardarPaciente(dni, sip, nombre, apellido1) {
    let token = sessionStorage.getItem('token_hospital_gest');

    // Configuración de la petición
    fetch('wspacientes.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token  // Token real aquí
        },
        body: JSON.stringify({ dni: dni, sip: sip, nombre: nombre, apellido1: apellido1 }) // enviar los nuevos detalles del paciente en el cuerpo
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json(); // o response.text() si el servidor responde con texto
        })
        .then(data => {
            console.log('Paciente editado:', data);
            // Aquí puedes añadir código para actualizar la interfaz de usuario, como actualizar la fila de la tabla
        })
        .catch(error => {
            console.error('Error al editar paciente:', error);
            // Manejo de errores, como mostrar un mensaje al usuario
        });
}

// borrar paciente
function borrarPaciente(dni) {
    let token = sessionStorage.getItem('token_hospital_gest');

    if (!confirm('¿Estás seguro de que quieres borrar al paciente con DNI ' + dni + '?')) {
        return; // Si el usuario no confirma, no hacer nada
    }

    // Configuración de la petición
    fetch('wspacientes.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token  // Token real aquí
        },
        body: JSON.stringify({ dni: dni }) // enviar acción y DNI en el cuerpo
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json(); // o response.text() si el servidor responde con texto
        })
        .then(data => {
            console.log('Paciente borrado:', data);
            // Aquí puedes añadir código para actualizar la interfaz de usuario, como quitar la fila de la tabla
        })
        .catch(error => {
            console.error('Error al borrar paciente:', error);
            // Manejo de errores, como mostrar un mensaje al usuario
        });
}


