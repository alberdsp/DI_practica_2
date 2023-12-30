<?php

/**
 * ABF 2023
 * api CRUD de pacientes, mediante Metodo GET,POST,PUT y DELETE
 * recibimos y enviamos en formato JSON 
 */



// incluimos config con la bd y clase paciente
include 'config.php';
include 'Paciente.php';
include 'validar_token.php';



try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    exit('Error de conexión a la base de datos: ' . $e->getMessage());
}

header('Content-Type: application/json');

// capturamos el método para saber la acción a realizar
$method = $_SERVER['REQUEST_METHOD'];


// capturamos el  token recibido

$tokenRecibido = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

// Validar el token
if (!validarToken($tokenRecibido, $pdo)) {
    header('HTTP/1.1 401 Unauthorized');
    exit(json_encode(['error' => 'Acceso no autorizado']));
}


// si el token es válido evaluamos el JSON
if (validarToken($tokenRecibido, $pdo)) {

    switch ($method) {
        case 'GET':
            $filtros = $_GET;
            $pacientes = Paciente::obtenerPacientes($pdo, $filtros);
            echo json_encode($pacientes);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data) {
                $paciente = new Paciente(
                    $data['id'] ?? null,
                    $data['nombre'] ?? null,
                    $data['edad'] ?? null,
                    $data['genero'] ?? null
                );
                $resultado = $paciente->insertar($pdo);
                echo json_encode(['resultado' => $resultado]);
            } else {
                echo json_encode(['error' => 'Datos inválidos']);
            }
            break;

        case 'PUT':
            parse_str(file_get_contents("php://input"), $put_vars);
            $data = $put_vars;
            if ($data) {
                $paciente = new Paciente(
                    $data['id'] ?? null,
                    $data['nombre'] ?? null,
                    $data['edad'] ?? null,
                    $data['genero'] ?? null
                );
                $resultado = $paciente->actualizar($pdo);
                echo json_encode(['resultado' => $resultado]);
            } else {
                echo json_encode(['error' => 'Datos inválidos']);
            }
            break;

        case 'DELETE':
            parse_str(file_get_contents("php://input"), $delete_vars);
            $id = $delete_vars['id'] ?? null;
            if ($id) {
                $paciente = new Paciente($id);
                $resultado = $paciente->eliminar($pdo);
                echo json_encode(['resultado' => $resultado]);
            } else {
                echo json_encode(['error' => 'ID inválido o no proporcionado']);
            }
            break;

        default:
            echo json_encode(['error' => 'Método no soportado']);
            break;
    }
}
