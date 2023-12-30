<?php

/**
 * ABF 2023
 * función para validar token recibido contra users en la base de datos.
 * en el futuro se le podría implementar expiración del mismo
 */


function validarToken($tokenRecibido, $pdo) {
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE remember_token = ?");
    $stmt->execute([$tokenRecibido]);
    $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($tokenData) {
       
       return true;
        
    }

    return false;
}

// Conectar a la base de datos
include 'config.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    exit('Error de conexión a la base de datos: ' . $e->getMessage());
}



?>
