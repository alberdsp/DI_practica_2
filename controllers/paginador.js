
// paginador controller

var paginaActual = 1;
var limitePaginas = 10; // limite de paginas a mostrar
var registroInicio = 0; // registro inicial
var totalPaginas = 10; // total de paginas

// Funcion para cargar la pagina
function cargarPagina(numeroPag) {
    // Load the page here
    console.log(`Cargar página ${numeroPag}`);
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
                registroInicio = (paginaActual - 1) * limitePaginas;
            }

            //  registroInicio = 1;
            console.log(`estas en  ${paginaActual}`);
            document.getElementById('buscar').click();  // buscar   

            break;
        case 'siguiente':
            if (paginaActual < totalPaginas) {
                paginaActual++;
                registroInicio = (paginaActual - 1) * limitePaginas;
            }

            document.getElementById('buscar').click();  // buscar  
            console.log(`estas en  ${paginaActual}`);
            break;
        case 'ultima':

        // todo falta obtener el total de paginas 
            paginaActual = totalPaginas;
            console.log(`estas en  ${paginaActual}`);
            break;
    }

    
});

// Cargar la pagina inicial
cargarPagina(paginaActual);