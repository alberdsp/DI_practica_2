<?php

/**
 * ABF 2023
 * api CRUD de medicos, mediante Metodo GET,POST,PUT y DELETE
 * recibimos y enviamos en formato JSON 
 */

// incluimos config con la bd y clase Medico
include '../config.php';
include '../models/Medico.php';
include '../validar_token.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit();
}




// capturamos el método para saber la acción a realizar
$method = $_SERVER['REQUEST_METHOD'];

// forzamos a recoger el encabezado para leer el token

$autenticado = false;
$headers = apache_request_headers();

if (isset($headers["Authorization"])) {

    // Extrae el token del encabezado
    $authHeader = $headers["Authorization"];

    list($bearer, $token) = explode(' ', $authHeader);

    if (strcasecmp($bearer, "Bearer") == 0 && !empty($token)) {
        // Validar el token
        if (!validarToken($token, $pdo)) {
            http_response_code(401);
            echo json_encode(['error' => 'Acceso no autorizado']);
            exit();
        } else {

            $autenticado = true;
        }
    } else {
        echo "Formato de encabezado de autorización inválido.";
    }
} else {
    echo "Encabezado de autorización no encontrado.";
}




// si autenticamos 

if ($autenticado) {




    try {
        switch ($method) {
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
            
                $result = Medico::obtenerMedicos($pdo, $data);
            
                // Prepare the data for the JSON response
                $respuesta = [];
                foreach ($result['medicos'] as $medico) {
                    $respuesta[] = [
                        'numero_colegiado' => isset($medico->numero_colegiado) ? $medico->numero_colegiado : null,
                        'dni' => isset($medico->dni) ? $medico->dni : null,
                        'nombre' => isset($medico->nombre) ? $medico->nombre : null,
                        'apellido1' => isset($medico->apellido1) ? $medico->apellido1 : null
                    ];
                }
            
                // Add the total number of records to the result
                echo json_encode(['data' => $respuesta, 'total_registros' => $result['regCount']]);
                break;


            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);



                if (isset($data['dni'])) {
                    try {
                        $medico = new Medico();
                        $medico->numero_colegiado = isset($data['numero_colegiado']) ? $data['numero_colegiado'] : null;
                        $medico->dni = $data['dni'];
                        $medico->nombre = isset($data['nombre']) ? $data['nombre'] : null;
                        $medico->apellido1 = isset($data['apellido1']) ? $data['apellido1'] : null;

                        $resultado = Medico::actualizar($pdo, $medico);

                        echo json_encode(['result' => $resultado]);
                    } catch (Exception $e) {
                        error_log("Exception capturada Medico::actualizar: " . $e->getMessage());
                        throw $e;
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'DNI no proporcionado']);
                }
                break;


            case 'DELETE':
                error_log("DELETE request received");
                $data = json_decode(file_get_contents('php://input'), true);

                if (isset($data['dni'])) {
                    error_log("DNI received: " . $data['dni']);  // Log  DNI
                    try {
                        $resultado = Medico::eliminar($pdo, $data['dni']);
                    } catch (Exception $e) {
                        error_log("Exception capturada Medico::eliminar: " . $e->getMessage());  // Log mensaje de error
                        throw $e;  // Re-throw excepción para que el controlador la capture
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'DNI no proporcionado']);
                }
                break;


            default:
                http_response_code(405);
                echo json_encode(['error' => 'Método no soportado']);
                break;
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error interno del servidor']);
    }
}
