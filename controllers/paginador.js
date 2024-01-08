
// paginador controller

var paginaActual = 1;
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
            console.log(`estas en  ${paginaActual}`);
            break;
        case 'anterior':
            if (paginaActual > 1) {
                paginaActual--;
            }
            console.log(`estas en  ${paginaActual}`);
            break;
        case 'siguiente':
            if (paginaActual < totalPaginas) {
                paginaActual++;
            }
            console.log(`estas en  ${paginaActual}`);
            break;
        case 'ultima':
             paginaActual = totalPaginas;
            console.log(`estas en  ${paginaActual}`);
            break;
    }

 //   cargarPagina(paginaActual);
});

// Cargar la pagina inicial
cargarPagina(paginaActual);