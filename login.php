<?php


// "unai97@ulloa.es", "password": "1234"

/**
 *   ABF 2023
 *  API que nos devuelve graba un token y lo devuelve si el usuario es autenticado en la BD
 *  recibe email y password, el password es veryficado por hash y devuelve JSON
 *  @email
 *  @password
 */

include 'config.php';
include 'User.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    exit('Error de conexión a la base de datos: ' . $e->getMessage());
}

header('Content-Type: application/json');

// Obtener los datos JSON enviados por el usuario
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Consultar la base de datos para el usuario
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);


// verificamos el password decodificando hash bcrypt

 if ($user && password_verify($password, $user['password'])) {

    
    // Verificar si el remember_token está en blanco y generar uno nuevo si es necesario
    // no hemos implementado caducidad aunque podría hacerse.
    if (empty($user['remember_token'])) {
        $user['remember_token'] = bin2hex(random_bytes(16)); // Generar un token aleatorio
        $updateStmt = $pdo->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
        $updateStmt->execute([$user['remember_token'], $user['id']]);
    }

    // Devolver el token al usuario
     echo json_encode(['token' => $user['remember_token']]);
   
    
} else {
    // Credenciales incorrectas
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales incorrectas']);
}
?>
