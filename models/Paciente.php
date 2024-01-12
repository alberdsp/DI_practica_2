<?php

/**
 * ABF 2023
 * Clase Paciente, contiene los datos esenciales de un paciente.
 */

class Paciente
{
    public $sip;
    public $dni;
    public $nombre;
    public $apellido1;

    // Constructor
    function __construct($sip = null, $dni = null, $nombre = null, $apellido1 = null)
    {
        if (func_num_args() > 0) {
            $this->sip = $sip;
            $this->dni = $dni;
            $this->nombre = $nombre;
            $this->apellido1 = $apellido1;
        }
    }


    // Métodos para el manejo de la base de datos


    //  Obtener todos los pacientes de la base de datos filtrando y poniendo limites

    public static function obtenerPacientes($pdo, $filtros = [])
{
    $sql = "SELECT sip, dni, nombre, apellido1 FROM pacientes";
    $parametros = [];

    // Create a separate SQL query to get the total count of records
    $sqlCount = "SELECT COUNT(*) FROM pacientes";

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

    // Hacemos la consulta para obtener el total de registros
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

    $pacientes = $stmt->fetchAll(PDO::FETCH_CLASS, 'Paciente');

    // Return the patients and the total count of records
    return ['pacientes' => $pacientes, 'regCount' => $regCount];
}






    // Actualizar datos del paciente en la base de datos, si no existe lo crea
    public static function actualizar($pdo, $paciente)
    {

        // preparamos la transacción
        $pdo->beginTransaction();

        try {

            // consultamos el si id del paciente existe
            $sql = "SELECT id FROM pacientes WHERE dni = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$paciente->dni]);
            $objpaciente = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($objpaciente) {

                if (empty($paciente->dni)) {
                    throw new Exception("El DNI es obligatorio para actualizar.");
                }

                $sql = "UPDATE pacientes SET sip = ?, nombre = ?, apellido1 = ? WHERE dni = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$paciente->sip, $paciente->nombre, $paciente->apellido1, $paciente->dni]);
                $pdo->commit();
                return true;
            } else {
                // si no existe el paciente lo creamos
                $sql = "INSERT INTO pacientes (sip, dni, nombre, apellido1) VALUES (?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$paciente->sip, $paciente->dni, $paciente->nombre, $paciente->apellido1]);
                $pdo->commit();
                return  true;
            }
        } catch (Exception $e) {
            // ocurrió error, hacemos roll back de la transacción
            $pdo->rollBack();
            throw $e;
        }
    }



    // función para eliminar paciente y todas sus foreing keys
    public static function eliminar($pdo, $dni)
    {
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





    // localizar paciente para editar datos por dni
    public static function obtenerPacientePorDni($pdo, $dni)
    {
        $sql = "SELECT sip, dni, nombre, apellido1 FROM pacientes WHERE dni = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$dni]);
        return $stmt->fetchObject('Paciente');
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
