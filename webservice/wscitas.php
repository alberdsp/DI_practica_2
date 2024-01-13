<?php

/**
 * ABF 2023
 * api CRUD de citas, mediante Metodo GET,POST,PUT y DELETE
 * recibimos y enviamos en formato JSON 
 */

// incluimos config con la bd y clase cita

include '../config.php';
include '../models/Cita.php';
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
            
                $result = Cita::obtenerCitas($pdo, $data);
              

            
                // prepara el resultado para el JSON
                $respuesta = [];
                foreach ($result['citas'] as $cita) {
                    $respuesta[] = [
                        'id' => isset($cita->id) ? $cita->id : null,
                        'fecha' => isset($cita->fecha) ? $cita->fecha : null,
                        'paciente_id' => isset($cita->paciente_id) ? $cita->paciente_id : null,
                        'medico_id' => isset($cita->medico_id) ? $cita->medico_id : null,

                    ];
                }
            
            
                // añadimos el total de registros para el paginador
                echo json_encode(['data' => $respuesta, 'total_registros' => $result['regCount']]);
                break;

            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);


                    // comprobamos que recibimos el id de la cita a actualizar
               



                      echo var_dump($data);


                    try {


                        // si no hay id, creamos una cita nueva
                        if (!isset($data['id'])) {
                        $cita = new Cita();
                        $cita->fecha = $data['fecha'];
                        $cita->paciente_id = isset($data['paciente_id']) ? $data['paciente_id'] : null;
                        $cita->medico_id = isset($data['medico_id']) ? $data['medico_id'] : null;

                        $resultado = Cita::actualizar($pdo, $cita);

                        echo json_encode(['result' => $resultado]);

                        }else{
                            // si  hay id, actualizamos la cita
                            $cita = new Cita();
                            $cita->id = isset($data['id']) ? $data['id'] : null;
                            $cita->fecha = $data['fecha'];
                            $cita->paciente_id = isset($data['paciente_id']) ? $data['paciente_id'] : null;
                            $cita->medico_id = isset($data['medico_id']) ? $data['medico_id'] : null;
    
                            $resultado = Cita::actualizar($pdo, $cita);
    
                            echo json_encode(['result' => $resultado]);
                        }




                    } catch (Exception $e) {
                        error_log("Exception capturada Cita::actualizar: " . $e->getMessage());
                        throw $e;
                    }
            
                break;


            case 'DELETE':
                error_log("DELETE request received");
                $data = json_decode(file_get_contents('php://input'), true);

                if (isset($data['id'])) {
                    error_log("id received: " . $data['id']);  // Log  fecha
                    try {
                        $resultado = Cita::eliminar($pdo, $data['id']);
                    } catch (Exception $e) {
                        error_log("Exception capturada cita::eliminar: " . $e->getMessage());  // Log mensaje de error
                        throw $e;  // throw la escepción para que el controlador la capture
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'id no proporcionado']);
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
