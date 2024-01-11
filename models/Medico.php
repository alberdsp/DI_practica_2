<?php

/**
 *   ABF 2023
 *  clase Medico, contiene los datos esenciales de un Medico
 * 
 */


 class Medico
 {

     public $numero_colegiado;
     public $dni;
     public $nombre;
     public $apellido1;
     public $especialidad_id;
 
     // Constructor
     function __construct( $numero_colegiado = null, $dni = null, $nombre = null, $apellido1 = null)
     {
         if (func_num_args() > 0) {
             $this->numero_colegiado = $numero_colegiado;
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
 
   // Métodos para el manejo de la base de datos


    //  Obtener todos los Medicos de la base de datos filtrando y poniendo limites

    public static function obtenerMedicos($pdo, $filtros = [])
{
    $sql = "SELECT numero_colegiado, dni, nombre, apellido1 FROM medicos";
    $parametros = [];

    // Create a separate SQL query to get the total count of records
    $sqlCount = "SELECT COUNT(*) FROM medicos";

    if (!empty($filtros)) {
        $clausulas = [];
        foreach ($filtros as $campo => $valor) {
            if ($campo !== 'limit' && $campo !== 'offset') {
                $clausulas[] = "$campo = ?";
                $parametros[] = $valor;
            }
        }
        if (!empty($clausulas)) {
            $sql .= " WHERE " . implode(' AND ', $clausulas);
            $sqlCount .= " WHERE " . implode(' AND ', $clausulas);
        }
    }

    // obtenemos el total de registros
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute($parametros);
    $regCount = $stmtCount->fetchColumn();

    // limitamos los resultados si se proporcionan los parámetros limit y offset
    $limit = isset($filtros['limit']) ? $filtros['limit'] : 10;
    $offset = isset($filtros['offset']) ? $filtros['offset'] : 0;

    // añadimos limit y offset a la consulta
    $sql .= " LIMIT $limit OFFSET $offset";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($parametros);

    $medicos = $stmt->fetchAll(PDO::FETCH_CLASS, 'Medico');



    // devuelvo un array con los medicos y el total de registros
    return ['medicos' => $medicos, 'regCount' => $regCount];
}
    // Actualizar datos del medico en la base de datos, si no existe lo crea

    public static function actualizar($pdo, $medico)
    {

        // preparamos la transacción
        $pdo->beginTransaction();

        try {

            // consultamos el si id del medico existe
            $sql = "SELECT id FROM medicos WHERE dni = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$medico->dni]);
            $objmedico = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($objmedico) {

                if (empty($medico->dni)) {
                    throw new Exception("El DNI es obligatorio para actualizar.");
                }

                $sql = "UPDATE medicos SET numero_colegiado = ?, nombre = ?, apellido1 = ? WHERE dni = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$medico->numero_colegiado, $medico->nombre, $medico->apellido1, $medico->dni]);
                $pdo->commit();
                return true;
            } else {
                // si no existe el medico lo creamos
                $sql = "INSERT INTO medicos (numero_colegiado, dni, nombre, apellido1,especialidad_id) VALUES (?, ?, ?, ?, 1)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$medico->numero_colegiado, $medico->dni, $medico->nombre, $medico->apellido1, $medico->especialidad_id]);
                $pdo->commit();
                return  true;
            }
        } catch (Exception $e) {
            // ocurrió error, hacemos roll back de la transacción
            $pdo->rollBack();
            throw $e;
        }
    }



 
    // función para eliminar medico y todas sus foreing keys
    public static function eliminar($pdo, $dni)
    {
        if (empty($dni)) {
            throw new Exception("El dni es obligatorio para borrar.");
        }

        // preparamos la transacción
        $pdo->beginTransaction();

        try {
            // consultamos el id del medico 
            $sql = "SELECT id FROM medicos WHERE dni = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$dni]);
            $medico = $stmt->fetch(PDO::FETCH_ASSOC);
           

            if ($medico) {
                // obtenemos id de medico
                $sql = "SELECT id FROM citas WHERE medico_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$medico['id']]);
                $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

                //echo var_dump($citas[0]['id']); 

                foreach ($citas as $cita) {
                    // borramos los tratamientos de cada cita del medico
                    $sql = "DELETE FROM tratamientos WHERE cita_id = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$cita['id']]);

                    //echo var_dump($cita['id']);
                }

                 

                // borramos las citas del medico
                $sql = "DELETE FROM citas WHERE medico_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$medico['id']]);

           
               
                // establecemos el medico a null en los pacientes
                $sql = "UPDATE pacientes SET medico_id = null WHERE medico_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$medico['id']]);
                         

                // borramos al medico
                $sql = "DELETE FROM medicos WHERE dni = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$dni]);
                  
                // realizamos la transacción
                $pdo->commit();

                return true;
            } else {
                throw new Exception("No se encontró al medico con el DNI proporcionado.");
            }
        } catch (Exception $e) {
            // ocurrió error, hacemos roll back de la transacción
            $pdo->rollBack();
            throw $e;
        }
    }





    // localizar medico para editar datos por dni
    public static function obtenerMedicoPorDni($pdo, $dni)
    {
        $sql = "SELECT numero_colegiado, dni, nombre, apellido1 FROM medicos WHERE dni = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$dni]);
        return $stmt->fetchObject('Medico');
    }

    // Convertir objeto a JSON
    public function toJson()
    {
        return json_encode(get_object_vars($this));
    }

    // Crear un objeto medico desde JSON
    public static function fromJson($jsonString)
    {
        $data = json_decode($jsonString, true);
        return new self($data['numero_colegiado'], $data['dni'], $data['nombre'], $data['apellido1']);

        echo var_dump($data);
    }
}
