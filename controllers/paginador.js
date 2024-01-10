
// paginador controller

var paginaActual = 1;
var limiteRegistros = 10; // limite de paginas a mostrar
var registroInicio = 0; // registro inicial
var totalPaginas = 0; // total de paginas

// Funcion para cargar la pagina
function cargarPagina(numeroPag) {
    // Load the page here
    console.log(`Cargar página ${numeroPag}`);
}


// funcion para obtener el total de paginas
function obtenerTotalPaginas(totalRegistros) {

    totalPaginas = Math.ceil(totalRegistros / limiteRegistros);

// instertamos el total de paginas, pagina actual y nº de registros  en el elemento html

 
    document.getElementById('detalleregistros').innerHTML = "  *  " + totalRegistros + "  registros -   " + 
    "  página " + paginaActual + " de " + totalPaginas;

}


// Listeners para los botones
document.querySelector('.pagination').addEventListener('click', (event) => {

    event.preventDefault();

    const action = event.target.getAttribute('data-action');
    console.log(`Action: ${action}`); // Add this line
    switch (action) {
        case 'primera':
            paginaActual = 1;
            registroInicio = 0;
            document.getElementById('buscar').click();  // buscar  
            console.log(`estas en  ${paginaActual}`);
            break;
        case 'anterior':
            if (paginaActual > 1) {
                paginaActual--;
                registroInicio = (paginaActual - 1) * limiteRegistros;
            }

            //  registroInicio = 1;
            console.log(`estas en  ${paginaActual}`);
            document.getElementById('buscar').click();  // buscar   

            break;
        case 'siguiente':
            if (paginaActual < totalPaginas) {
                paginaActual++;
                registroInicio = (paginaActual - 1) * limiteRegistros;
            }

            document.getElementById('buscar').click();  // buscar  
            console.log(`estas en  ${paginaActual}`);
            break;
        case 'ultima':


            paginaActual = totalPaginas;
            registroInicio = (totalPaginas - 1) * totalRegistros;



            registroInicio = (paginaActual - 1) * limiteRegistros;

            // calculamos el limite de registros a mostrar
            limimitRegistros = totalRegistros - registroInicio;
            document.getElementById('buscar').click();  // buscar

            //seteamos el limite de registros a 10 para la sieguiente consulta
            limiteRegistros = 10;



            break;
    }


});

// Cargar la pagina inicial
cargarPagina(paginaActual);