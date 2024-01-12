


/**
 *   ABF 2023
 *  controlador de citas_list.html
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
   // let id = document.getElementById('id').value;
    let fecha = document.getElementById('fecha').value;
    let paciente = document.getElementById('paciente').value;
    let medico = document.getElementById('medico').value;


    // promesa asyncrona para recibir los datos si existe cita
    let response = await buscarCita(fecha, paciente, medico);

    // si existe cita para ese paciente mostramos un mensaje de alerta
    if (response.data && response.data.length > 0) {
        alert('El cita para este paciente ya existe');
        // si hay campos vacios mostramos un mensaje de alerta
    } else if (fecha == '' || paciente == '' || medico == '') {
        alert('Debes rellenar todos los campos');

        // finalemnte si no existe el cita y los campos no estan vacios insertamos
    } else {
        guardarCita(fecha, paciente, medico);
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
    //filtros.fecha = filtros.fecha + ":00"; // Add ":00" to the end to represent seconds
    filtros.limit = limit;
    filtros.offset = offset;


   
    // Solicitud Fetch al servidor
    fetch('webservice/wscitas.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token  // Token real aquí
        },
        body: JSON.stringify(filtrarYPrepararDatos(filtros))

       
        //body: JSON.stringify(filtros)
    })
        
    
        .then(response => {
            if (response.headers.get("content-type").includes("application/json")) {
                console.log(JSON.stringify(filtrarYPrepararDatos(filtros)))
               
                return response.json();
            } else {
                console.log(JSON.stringify(filtrarYPrepararDatos(filtros)))
                return response.text().then(text => { throw new Error(text) });
            }
        })

  
        
        .then(data => {
            // console.log(data); // Imprimir para depuración

            console.log(data);
            mostrarCitas(data);
        })
        .catch(error => console.error('Error:', error));
}



// función para buscar citas por fecha
function buscarCita(fecha) {
    // Captura del token de la sesión
    let token = sessionStorage.getItem('token_hospital_gest');

    // Solicitud Fetch al servidor
    return fetch('webservice/wscitas.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token  // Token real aquí
        },
        body: JSON.stringify({ fecha: fecha })
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
            mostrarCitas(data);
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

function mostrarCitas(respuesta) {
    const contenedor = document.getElementById('lista_medicos');
    contenedor.innerHTML = ''; // Limpiar el contenedor actual

    // Crear la tabla
    const tabla = document.createElement('table');
    tabla.classList.add('table');


// si la respuesta es correcta y el array no esta vacio

    if (respuesta && Array.isArray(respuesta.data)) {
        respuesta.data.forEach(cita => {
            // Crear una fila para cada cita
            const fila = document.createElement('tr');

            // Crear y añadir celdas para los detalles del cita
            fila.appendChild(crearCelda(cita.id));
            fila.appendChild(crearCelda(cita.fecha));
            fila.appendChild(crearCelda(cita.paciente_id));
            fila.appendChild(crearCelda(cita.medico_id));

            // Crear celda para los botones
            const celdaBotones = document.createElement('td');

            /// Botón de editar
            const botonEditar = document.createElement('button');
            botonEditar.innerText = 'Editar';
            botonEditar.classList.add('btn', 'btn-primary', 'mr-2');
            botonEditar.setAttribute('data-fecha', cita.fecha);
            botonEditar.onclick = function () {
                editarCita(this.getAttribute('data-fecha'));
            };

            celdaBotones.appendChild(botonEditar);


            // Botón de borrar
            const botonBorrar = document.createElement('button');
            botonBorrar.innerText = 'Borrar';
            botonBorrar.classList.add('btn', 'btn-danger', 'mr-2');
            botonBorrar.setAttribute('data-id', cita.id);
            botonBorrar.onclick = function () {
                borrarCita(this.getAttribute('data-id'));
            };


            celdaBotones.appendChild(botonBorrar);

            // Añadir la celda de botones a la fila
            fila.appendChild(celdaBotones);

            // Añadir la fila a la tabla con un margen adicional
            fila.classList.add('fila-cita');

            // Añadir la fila a la tabla
            tabla.appendChild(fila);
        });
        // Añadir la tabla al contenedor
        contenedor.appendChild(tabla);

        // llamamos a la función para obtener el total de paginas del paginador.js
        obtenerTotalPaginas(respuesta.total_registros);

    } else {
        console.error('Se esperaba un objeto con una propiedad "data" que es un array, pero se recibió:', respuesta);
        contenedor.innerText = 'No se pudieron cargar los datos de las citas.';
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



// funcion para editar cita
function editarCita(id) {
    let token = sessionStorage.getItem('token_hospital_gest');

    fetch('webservice/wsmedicos.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ id: id })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            console.log('CITA EDITADA:', data);

            // Rellenamos el formulario con los datos del cita
            document.getElementById('id').value = data.data[0]['id'];
            document.getElementById('fecha').value = data.data[0]['fecha'];
            document.getElementById('paciente').value = data.data[0]['paciente'];
            document.getElementById('medico').value = data.data[0]['medico'];

            // botón de guardar
            let botonGuardar = document.createElement('button');
            botonGuardar.id = 'botonGuardar'; // Assign the ID
            botonGuardar.innerText = 'Guardar';
            botonGuardar.classList.add('btn', 'btn-primary', 'mr-2');
            botonGuardar.onclick = function () {
                let id = document.getElementById('id').value;
                let fecha = document.getElementById('fecha').value;
                let paciente = document.getElementById('paciente').value;
                let medico = document.getElementById('medico').value;
                guardarCita(fecha, paciente, medico);
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
            console.error('Error al editar Cita:', error);
        });
}

// Guardar Cita, también se usa para insertar

function guardarCita(fecha, paciente, medico) {
    let token = sessionStorage.getItem('token_hospital_gest');

    let url = 'webservice/wscitas.php'; // webserice url
    let data = { id: id, fecha: fecha, paciente: paciente, medico: medico };

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



// borrar cita
function borrarCita(id) {
    let token = sessionStorage.getItem('token_hospital_gest');

    if (!confirm('¿Estás seguro de que quieres borrar la cita con id' + id + '?')) {
        return; // Si el usuario no confirma, no hacer nada
    }

    // Configuración de la petición
    fetch('webservice/wscitas.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token  // Token real aquí
        },
        body: JSON.stringify({ id: id }) // enviar acción e id en el cuerpo
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            alert('Cita borrada correctamente');
            resetearFormulario();
            return response.json(); // o response.text() si el servidor responde con texto
        })
        .then(data => {
            console.log('Cita borrado:');
            alert('Cita borrado correctamente');
            resetearFormulario();
            // Aquí puedes añadir código para actualizar la interfaz de usuario, como quitar la fila de la tabla
        })
        .catch(error => {
            // console.error('Error al borrar Cita:', error);
            // Manejo de errores, como mostrar un mensaje al usuario
        });
}


