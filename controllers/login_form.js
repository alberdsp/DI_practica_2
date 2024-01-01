
/**
 *   ABF 2023
 *  controlador del login
 * 
 */


    document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Previene el envío tradicional del formulario

    // Obtiene los valores del formulario
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;




    // Prepara los datos para enviar al login.php
    var data = {
        email: email,
        password: password
    };

    // Realiza la solicitud POST a login.php
    fetch('login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {

            return response.json();


        })
        .then(data => {
            // Si el inicio de sesión es correcto y recibimos token
            if (data.token) {
                // almacenamos el token en variable de sesion
                sessionStorage.setItem('token_hospital_gest', data.token);
                document.getElementById('message').textContent = 'Acceso permitido';
                window.location.href = 'citas_list.html'; // Redirecciona a listado.php
                

            } else {

                // Muestra un mensaje de error
                document.getElementById('message').textContent = 'Credenciales incorrectas';
               

            }


        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('message').textContent = 'Error en el inicio de sesión';
        });
});
