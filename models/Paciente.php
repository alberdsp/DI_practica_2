<?php

/**
 * ABF 2023
 * Clase Paciente, contiene los datos esenciales de un paciente.
 */

 class Paciente {
    public $sip;
    public $dni;
    public $nombre;
    public $apellido1;

    // Constructor
    function __construct($sip = null, $dni = null, $nombre = null, $apellido1 = null) {
        if (func_num_args() > 0) {
            $this->sip = $sip;
            $this->dni = $dni;
            $this->nombre = $nombre;
            $this->apellido1 = $apellido1;
        }
    }
    

    // Método mágico GET
    public function __get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
        }
    }

    // Método mágico SET
    public function __set($property, $value)
    {
        if (property_exists($this, $property)) {
            $this->$property = $value;
        }
        return $this;
    }

    // Métodos para el manejo de la base de datos

    // Obtener pacientes de la base de datos con filtros
    public static function obtenerPacientes($pdo, $filtros = []) {
        $sql = "SELECT sip, dni, nombre, apellido1 FROM pacientes";
        $parametros = [];
    
        if (!empty($filtros)) {
            $clausulas = [];
            foreach ($filtros as $campo => $valor) {
                $clausulas[] = "$campo = ?";
                $parametros[] = $valor;
            }
            $sql .= " WHERE " . implode(' AND ', $clausulas);
        }
    
        $stmt = $pdo->prepare($sql);
        $stmt->execute($parametros);
   

    
        return $stmt->fetchAll(PDO::FETCH_CLASS, 'Paciente');
    }
    

    // Insertar nuevo paciente en la base de datos
    public function insertar($pdo)
    {

        $sql = "INSERT INTO pacientes (nombre, edad, genero) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$this->nombre, $this->edad, $this->genero]);
    }

    // Actualizar datos del paciente en la base de datos
    public function actualizar($pdo)
    {
        if (empty($this->id)) {
            throw new Exception("El ID es obligatorio para actualizar.");
        }

        $sql = "UPDATE pacientes SET nombre = ?, edad = ?, genero = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$this->nombre, $this->edad, $this->genero, $this->id]);
    }

    public static function eliminar($pdo, $dni) {
   
     
            // Eliminar el paciente
            $sql = "DELETE FROM pacientes WHERE dni = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$dni]);
            return $stmt->execute([$dni]);
       
    }
    

    // Convertir objeto a JSON
    public function toJson()
    {
        return json_encode(get_object_vars($this));
    }

    // Crear un objeto Paciente desde JSON
    public static function fromJson($jsonString)
    {
        $data = json_decode($jsonString, true);
        return new self($data['sip'], $data['dni'], $data['nombre'], $data['apellido1']);
    }
}
