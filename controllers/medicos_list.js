


/**
 *   ABF 2023
 *  controlador de medicos_list.html
 * 
 */

// listener para el botón de buscar

// variables para el paginador
var totalRegistros = 0;

// obtenemos el token de la sesión para controlar el acceso rdirecto a la página
let token = sessionStorage.getItem('token_hospital_gest');

// Si el token no existe redirigimos al login
if (!token) {
    window.location.href = './index.html'; 
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filtroForm').addEventListener('submit', (event) => {
        event.preventDefault();


        // raliar la busqueda con los datos del formulario y limites de la paginación
        realizarBusqueda(limiteRegistros,registroInicio);
    });
});



// listener para el botón de limpiar
document.getElementById('limpiar').addEventListener('click', (event) => {
    event.preventDefault();

    resetearFormulario();
});



// listener para el boton de insertar
document.getElementById('insertar').addEventListener('click', async (event) => {
    event.preventDefault();
    let numero_colegiado = document.getElementById('numero_colegiado').value;
    let dni = document.getElementById('dni').value;
    let nombre = document.getElementById('nombre').value;
    let apellido1 = document.getElementById('apellido1').value;


    // promesa asyncrona para recibir los datos si existe el paciente
    let response = await buscarPaciente(dni);

    // si el paciente existe mostramos un mensaje de alerta
    if (response.data && response.data.length > 0) {
        alert('El paciente ya existe');
        // si hay campos vacios mostramos un mensaje de alerta
    } else if (numero_colegiado == '' || dni == '' || nombre == '' || apellido1 == '') {
        alert('Debes rellenar todos los campos');

        // finalemnte si no existe el paciente y los campos no estan vacios lo insertamos
    } else {
        guardarPaciente(numero_colegiado, dni, nombre, apellido1);
    }
});



// función para realizar la busqueda


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
    fetch('webservice/wsmedicos.php', {
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
            // console.log(data); // Imprimir para depuración

            console.log(data);
            mostrarMedicos(data);
        })
        .catch(error => console.error('Error:', error));
}



// función para buscar paciente por dni
function buscarPaciente(dni) {
    // Captura del token de la sesión
    let token = sessionStorage.getItem('token_hospital_gest');

    // Solicitud Fetch al servidor
    return fetch('webservice/wsmedicos.php', {
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
            // console.log(data); // Imprimir para depuración
            mostrarMedicos(data);
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
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

function mostrarMedicos(respuesta) {
    const contenedor = document.getElementById('lista_medicos');
    contenedor.innerHTML = ''; // Limpiar el contenedor actual

    // Crear la tabla
    const tabla = document.createElement('table');
    tabla.classList.add('table');

    if (respuesta && Array.isArray(respuesta.data)) {
        respuesta.data.forEach(paciente => {
            // Crear una fila para cada paciente
            const fila = document.createElement('tr');

            // Crear y añadir celdas para los detalles del paciente
            fila.appendChild(crearCelda(paciente.numero_colegiado));
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

        // llamamos a la función para obtener el total de paginas del paginador.js
        obtenerTotalPaginas(respuesta.total_registros);

    } else {
        console.error('Se esperaba un objeto con una propiedad "data" que es un array, pero se recibió:', respuesta);
        contenedor.innerText = 'No se pudieron cargar los datos de los medicos.';
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



// funcion para editar paciente
function editarPaciente(dni) {
    let token = sessionStorage.getItem('token_hospital_gest');

    fetch('webservice/wsmedicos.php', {
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
            document.getElementById('numero_colegiado').value = data.data[0]['numero_colegiado'];
            document.getElementById('dni').value = data.data[0]['dni'];
            document.getElementById('nombre').value = data.data[0]['nombre'];
            document.getElementById('apellido1').value = data.data[0]['apellido1'];

            // botón de guardar
            let botonGuardar = document.createElement('button');
            botonGuardar.id = 'botonGuardar'; // Assign the ID
            botonGuardar.innerText = 'Guardar';
            botonGuardar.classList.add('btn', 'btn-primary', 'mr-2');
            botonGuardar.onclick = function () {
                let numero_colegiado = document.getElementById('numero_colegiado').value;
                let dni = document.getElementById('dni').value;
                let nombre = document.getElementById('nombre').value;
                let apellido1 = document.getElementById('apellido1').value;
                guardarPaciente(numero_colegiado, dni, nombre, apellido1);
            };

            // botón de cancelar
            let botonCancelar = document.createElement('button');
            botonCancelar.id = 'botonCancelar'; // Assign the ID
            botonCancelar.innerText = 'Cancelar';
            botonCancelar.classList.add('btn', 'btn-primary', 'mr-2');
            botonCancelar.onclick = function () {
                resetearFormulario();
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

            document.getElementById('buscar').style.display = 'none';
            document.getElementById('insertar').style.display = 'none';
            document.getElementById('limpiar').style.display = 'none';


        })
        .catch(error => {
            console.error('Error al editar paciente:', error);
        });
}

// Guardar paciente, también se usa para insertar

function guardarPaciente(numero_colegiado, dni, nombre, apellido1) {
    let token = sessionStorage.getItem('token_hospital_gest');

    let url = 'webservice/wsmedicos.php'; // webserice url
    let data = { numero_colegiado: numero_colegiado, dni: dni, nombre: nombre, apellido1: apellido1 };

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token // aquí  va el token
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('la respuesta fue fallida');
            }

            document.getElementById('buscar').style.display = 'inline-block';
            document.getElementById('insertar').style.display = 'inline-block';
            document.getElementById('limpiar').style.display = 'inline-block';
            document.getElementById('buscar').click();
            document.getElementById('botonGuardar').remove();
            document.getElementById('botonCancelar').remove();




            return response.json();

        })
        .then(data => {
            console.log('guardado correctamente');
        })
        .catch((error) => {
            console.log('Error: al guardar');
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
    document.getElementById('buscar').style.display = 'inline-block';
    document.getElementById('insertar').style.display = 'inline-block';
    document.getElementById('limpiar').style.display = 'inline-block';
    document.getElementById('buscar').click();

}



// borrar paciente
function borrarPaciente(dni) {
    let token = sessionStorage.getItem('token_hospital_gest');

    if (!confirm('¿Estás seguro de que quieres borrar al paciente con DNI ' + dni + '?')) {
        return; // Si el usuario no confirma, no hacer nada
    }

    // Configuración de la petición
    fetch('webservice/wsmedicos.php', {
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

            alert('Paciente borrado correctamente');
            resetearFormulario();
            return response.json(); // o response.text() si el servidor responde con texto
        })
        .then(data => {
            console.log('Paciente borrado:');
            alert('Paciente borrado correctamente');
            resetearFormulario();
            // Aquí puedes añadir código para actualizar la interfaz de usuario, como quitar la fila de la tabla
        })
        .catch(error => {
            // console.error('Error al borrar paciente:', error);
            // Manejo de errores, como mostrar un mensaje al usuario
        });
}


