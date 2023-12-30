<?php

/**
 * ABF 2023
 * Clase Paciente, contiene los datos esenciales de un paciente.
 */

class Paciente
{
    private $id;
    private $nombre;
    private $edad;
    private $genero;

    // Constructor
    function __construct($id = null, $nombre = null, $edad = null, $genero = null)
    {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->edad = $edad;
        $this->genero = $genero;
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
    public static function obtenerPacientes($pdo, $filtros = [])
    {
        $sql = "SELECT * FROM pacientes";
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

    // Eliminar paciente de la base de datos
    public function eliminar($pdo)
    {
        if (empty($this->id)) {
            throw new Exception("El ID es obligatorio para eliminar.");
        }

        $sql = "DELETE FROM pacientes WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$this->id]);
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
        return new self($data['id'], $data['nombre'], $data['edad'], $data['genero']);
    }
}
