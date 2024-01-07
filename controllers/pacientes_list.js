


/**
 *   ABF 2023
 *  controlador de pacientes_list.html
 * 
 */



// listener para el boton de buscar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('buscar').addEventListener('click', (event) => {
        event.preventDefault();
        realizarBusqueda();
    });
    // listener para el boton de insertar
    document.getElementById('insertar').addEventListener('click', (event) => {
        event.preventDefault();
        actualizarPaciente();
    });
    // listener para el boton de limpiar
    document.getElementById('limpiar').addEventListener('click', (event) => {
        event.preventDefault();
        resetearFormulario();
        realizarBusqueda();
    });
});

// listener para el boton de insertar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filtroForm').addEventListener('insertar', (event) => {
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


function realizarBusqueda(limit, offset) {
    // Captura del token de la sesión
    let token = sessionStorage.getItem('token_hospital_gest');

    // Preparación de los datos del formulario
    let formData = new FormData(document.getElementById('filtroForm'));
    let filtros = {};
    formData.forEach((value, key) => { filtros[key] = value; });

    // añadimos los limites de la consulta
    filtros.limit = limit;
    filtros.offset = offset;



    // Solicitud Fetch al servidor
    fetch('./wspacientes.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,  // Token real aquí
            'Cache-Control': 'no-cache'
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
            // console.log(data); // Imprimir para depuración
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
            'Authorization': 'Bearer ' + token,  // Token real aquí
            'Cache-Control': 'no-cache'
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
            // console.log(data); // Imprimir para depuración
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


// evento listener para asegurarnos que se carga primero el DOM



// metodo para editar paciente elimina los botones buscar e insertar y añade el boton de guardar y cancelar

function editarPaciente(dni) {


    let token = sessionStorage.getItem('token_hospital_gest');

    fetch('wspacientes.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token, // aquí  va el token
            'Cache-Control': 'no-cache'
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
            botonGuardar.id = 'botonGuardar'; // Asignamos el ID
            botonGuardar.innerText = 'Guardar';
            botonGuardar.classList.add('btn', 'btn-primary', 'mr-2');
            botonGuardar.onclick = function () {
                let sip = document.getElementById('sip').value;
                let dni = document.getElementById('dni').value;
                let nombre = document.getElementById('nombre').value;
                let apellido1 = document.getElementById('apellido1').value;
                guardarPaciente(sip, dni, nombre, apellido1);
            };

            // botón de cancelar
            let botonCancelar = document.createElement('button');
            botonCancelar.id = 'botonCancelar'; // Asignamos el ID
            botonCancelar.innerText = 'Cancelar';
            botonCancelar.classList.add('btn', 'btn-primary', 'mr-2');
            botonCancelar.onclick = function () {
                resetearFormulario();
            };

            // gestión de los botones de guardar, cancelar, buscar e insertar
            let botonGuardarActual = document.getElementById('botonGuardar');
            let botonCancelarActual = document.getElementById('botonCancelar');
            if (!(botonGuardarActual && botonCancelarActual)) {
                // añadimos el boton de guardar al formulario
                document.getElementById('filtroForm').appendChild(botonGuardar);
                // añadimos el boton de cancelar al formulario
                document.getElementById('filtroForm').appendChild(botonCancelar);
            }

            // eliminamos los botones de buscar e insertar
            let buscarButton = document.getElementById('buscar');
            let insertarButton = document.getElementById('insertar');

            if (buscarButton) {
                document.getElementById('buscar').remove();
            }

            if (insertarButton) {
                insertarButton.remove();
            }

        })
        .catch(error => {
            console.error('Error al editar paciente:', error);
        });
}


// Guardar paciente
function guardarPaciente(sip, dni, nombre, apellido1) {
    let token = sessionStorage.getItem('token_hospital_gest');

    let url = 'wspacientes.php'; // webserice url
    let data = { sip: sip, dni: dni, nombre: nombre, apellido1: apellido1 };

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token, // aquí  va el token
            'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('la respuesta fue fallida');
            }
            document.getElementById('buscar').click();
            // si el formulario contiene el boton de guardar y cancelar los borramos
            let botonGuardarActual = document.getElementById('botonGuardar');
            let botonCancelarActual = document.getElementById('botonCancelar');

            if ((botonGuardarActual && botonCancelarActual)) {
                document.getElementById('botonGuardar').remove();
                document.getElementById('botonCancelar').remove();
            }

            // añadimos los botones de buscar e insertar
            let botonBuscar = document.createElement('button');
            botonBuscar.id = 'buscar'; // asignamos el ID
            botonBuscar.innerText = 'Buscar';
            botonBuscar.classList.add('btn', 'btn-primary', 'mr-2');
            botonBuscar.onclick = function () {
                realizarBusqueda();
            }

            let botonInsertar = document.createElement('button');
            botonInsertar.id = 'insertar'; // Asignamos el ID
            botonInsertar.innerText = 'Insertar';
            botonInsertar.classList.add('btn', 'btn-primary', 'mr-2');
            botonInsertar.onclick = function () {
                guardarPaciente();
            }




            return response.json();

        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


// resetear formulario
function resetearFormulario() {

    document.getElementById('filtroForm').reset();

    let botonGuardarActual = document.getElementById('botonGuardar');
    let botonCancelarActual = document.getElementById('botonCancelar');
    // si el formulario contiene el boton de guardar y cancelar los borramos
    if ((botonGuardarActual && botonCancelarActual)) {
        document.getElementById('botonGuardar').remove();
        document.getElementById('botonCancelar').remove();
    }

    if (!document.getElementById('buscar') && !document.getElementById('insertar') && !document.getElementById('limpiar')) {
        // añadimos los botones de buscar e insertar
        let botonBuscar = document.createElement('button');
        botonBuscar.id = 'buscar'; // asignamos el ID
        botonBuscar.innerText = 'Buscar';
        botonBuscar.classList.add('btn', 'btn-primary', 'mr-2');
        botonBuscar.onclick = function () {
            realizarBusqueda();
        }

        let botonInsertar = document.createElement('button');
        botonInsertar.id = 'insertar'; // Asignamos el ID
        botonInsertar.innerText = 'Insertar';
        botonInsertar.classList.add('btn btn-success text-light mr-2', 'mr-2');
        botonInsertar.onclick = function () {
            guardarPaciente();
        }

        let botonLimpiar = document.createElement('button');
        botonLimpiar.id = 'limpiar'; // Assign the ID
        botonLimpiar.innerText = 'Limpiar';
        botonLimpiar.classList.add('btn', 'btn-primary', 'mr-2');
        botonLimpiar.onclick = function () {
            document.getElementById('filtroForm').reset();
        }



        document.getElementById('filtroForm').appendChild(botonBuscar);
        document.getElementById('filtroForm').appendChild(botonInsertar);
        document.getElementById('filtroForm').appendChild(botonLimpiar);
    }


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


