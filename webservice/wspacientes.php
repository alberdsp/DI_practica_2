<?php

/**
 * ABF 2023
 * api CRUD de pacientes, mediante Metodo GET,POST,PUT y DELETE
 * recibimos y enviamos en formato JSON 
 */

// incluimos config con la bd y clase paciente
include '../config.php';
include '../models/Paciente.php';
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
            
                $result = Paciente::obtenerPacientes($pdo, $data);
            
                // Preparar los datos para la respuesta JSON
                $respuesta = [];
                foreach ($result['pacientes'] as $paciente) {
                    $respuesta[] = [
                        'sip' => isset($paciente->sip) ? $paciente->sip : null,
                        'dni' => isset($paciente->dni) ? $paciente->dni : null,
                        'nombre' => isset($paciente->nombre) ? $paciente->nombre : null,
                        'apellido1' => isset($paciente->apellido1) ? $paciente->apellido1 : null
                    ];
                }
            
                // Incorporar el total de registros al resultado
                echo json_encode(['data' => $respuesta, 'total_registros' => $result['regCount']]);
                break;


            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);



                if (isset($data['dni'])) {
                    try {
                        $paciente = new Paciente();
                        $paciente->sip = isset($data['sip']) ? $data['sip'] : null;
                        $paciente->dni = $data['dni'];
                        $paciente->nombre = isset($data['nombre']) ? $data['nombre'] : null;
                        $paciente->apellido1 = isset($data['apellido1']) ? $data['apellido1'] : null;

                        $resultado = Paciente::actualizar($pdo, $paciente);

                        echo json_encode(['result' => $resultado]);
                    } catch (Exception $e) {
                        error_log("Exception capturada Paciente::actualizar: " . $e->getMessage());
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
                        $resultado = Paciente::eliminar($pdo, $data['dni']);
                    } catch (Exception $e) {
                        error_log("Exception capturada Paciente::eliminar: " . $e->getMessage());  // Log mensaje de error
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
