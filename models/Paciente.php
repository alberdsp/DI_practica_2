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


    // función para eliminar paciente y todas sus foreing keys
    public static function eliminar($pdo, $dni) {
        if (empty($dni)) {
            throw new Exception("El dni es obligatorio para borrar.");
        }
    
        // preparamos la transacción
        $pdo->beginTransaction();
    
        try {
            // consultamos el id del paciente 
            $sql = "SELECT id FROM pacientes WHERE dni = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$dni]);
            $paciente = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if ($paciente) {
                // obtenemos id de paciente
                $sql = "SELECT id FROM citas WHERE paciente_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$paciente['id']]);
                $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
                foreach ($citas as $cita) {
                    // borramos los tratamientos de cada cita del paciente
                    $sql = "DELETE FROM tratamientos WHERE cita_id = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$cita['id']]);
                }
    
                // borramos las citas del paciente
                $sql = "DELETE FROM citas WHERE paciente_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$paciente['id']]);
    
                // borramos al paciente
                $sql = "DELETE FROM pacientes WHERE dni = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$dni]);
    
                // realizamos la transacción
                $pdo->commit();
    
                return true;
            } else {
                throw new Exception("No se encontró al paciente con el DNI proporcionado.");
            }
        } catch (Exception $e) {
            // ocurrió error, hacemos roll back de la transacción
            $pdo->rollBack();
            throw $e;
        }
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
