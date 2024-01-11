<?php

/**
 *   ABF 2023
 *  clase Cita, contiene los datos esenciales de una cita
 */

class Cita
{
    public $id;
    public $fecha;
    public $medico_id;
    public $paciente_id;

    // Constructor
    public function __construct($id, $fecha, $medico_id, $paciente_id)
    {
        $this->setId($id);
        $this->setFecha($fecha);
        $this->setMedicoId($medico_id);
        $this->setPacienteId($paciente_id);
    }

    // Getters y Setters para cada propiedad
    public function getId()
    {
        return $this->id;
    }
    public function setId($id)
    {
        $this->id = $id;
    }

    public function getFecha()
    {
        return $this->fecha;
    }
    public function setFecha($fecha)
    {
        $this->fecha = $fecha;
    }

    public function getMedicoId()
    {
        return $this->medico_id;
    }
    public function setMedicoId($medico_id)
    {
        $this->medico_id = $medico_id;
    }

    public function getPacienteId()
    {
        return $this->paciente_id;
    }
    public function setPacienteId($paciente_id)
    {
        $this->paciente_id = $paciente_id;
    }


    // Métodos para el manejo de la base de datos

    // Obtener todas las citas de la base de datos filtrando y poniendo limites



    public static function obtenerCitas($pdo, $filtros = [])
    {
        $sql = "SELECT id, fecha, medico_id, paciente_id FROM citas";
        $parametros = [];

        // Create a separate SQL query to get the total count of records
        $sqlCount = "SELECT COUNT(*) FROM citas";

        if (!empty($filtros)) {
            $clausulas = [];
            foreach ($filtros as $campo => $valor) {
                if ($campo !== 'limit' && $campo !== 'offset') {
                    $clausulas[] = "$campo = :$campo";
                    $parametros[$campo] = $valor;
                }
            }
            $sql .= ' WHERE ' . implode(' AND ', $clausulas);
            $sqlCount .= ' WHERE ' . implode(' AND ', $clausulas);
        }

        // Añadimos los limites a la consulta
        if (isset($filtros['limit'])) {
            $sql .= ' LIMIT ' . $filtros['limit'];
        }
        if (isset($filtros['offset'])) {
            $sql .= ' OFFSET ' . $filtros['offset'];
        }

        // preparar la consulta
        $stmt = $pdo->prepare($sql);
        $stmt->execute($parametros);

        // Fech los resultados
        $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Obtener el total de registros
        $stmt = $pdo->prepare($sqlCount);
        $stmt->execute($parametros);
        $total = $stmt->fetchColumn();

        return ['citas' => $citas, 'total' => $total];
    }

    // Elimitar una cita de la base de datos
    public static function eliminar($pdo, $id)
    {
  
           // preparamos la transacción
           $pdo->beginTransaction();


           try {
   
               // consultamos el si id de la cita existe
               $sql = "SELECT id FROM citas WHERE id = ?";
               $stmt = $pdo->prepare($sql);
               $stmt->execute([$id]);
               $objcita = $stmt->fetch(PDO::FETCH_ASSOC);
   
               if ($objcita) {
   
                   // borramos los tratamientos de cada cita del medico
                   $sql = "DELETE FROM tratamientos WHERE cita_id = ?";
                   $stmt = $pdo->prepare($sql);
                   $stmt->execute([$objcita['id']]);
   
                   // borramos la cita
                   $sql = "DELETE FROM citas WHERE id = ?";
                   $stmt = $pdo->prepare($sql);
                   $stmt->execute([$id]);
                   $pdo->commit();
                   return $stmt->rowCount() > 0;
               } else {
                   throw new Exception("La cita no existe.");
               }
           } catch (Exception $e) {
               // ocurrió error, hacemos roll back de la transacción
               $pdo->rollBack();
               throw $e;
           }
    }

    




    // Actualizar una cita de la base de datos

    public static function actualizar($pdo, $cita)
    {

        // preparamos la transacción
        $pdo->beginTransaction();

        try {

            // consultamos si la cita existe
            $sql = "SELECT id FROM citas WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$cita->dni]);
            $objcita = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($objcita) {

                if (empty($cita->dni)) {
                    throw new Exception("El DNI es obligatorio para actualizar.");
                }

                $sql = "UPDATE citas SET numero_colegiado = ?, nombre = ?, apellido1 = ? WHERE dni = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$cita->numero_colegiado, $cita->nombre, $cita->apellido1, $cita->dni]);
                $pdo->commit();
                return true;
            } else {
                // si no existe el cita lo creamos
                $sql = "INSERT INTO citas (numero_colegiado, dni, nombre, apellido1,especialidad_id) VALUES (?, ?, ?, ?, 1)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$cita->numero_colegiado, $cita->dni, $cita->nombre, $cita->apellido1, $cita->especialidad_id]);
                $pdo->commit();
                return  true;
            }
        } catch (Exception $e) {
            // ocurrió error, hacemos roll back de la transacción
            $pdo->rollBack();
            throw $e;
        }
    }
}
