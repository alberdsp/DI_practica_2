<?php

/**
 *   ABF 2023
 *  clase Cita, contiene los datos esenciales de una cita
 */

class Cita {
    private $id;
    private $fecha;
    private $medico_id;
    private $paciente_id;
    private $created_at;
    private $updated_at;

    // Constructor
    public function __construct($id, $fecha, $medico_id, $paciente_id, $created_at, $updated_at) {
        $this->setId($id);
        $this->setFecha($fecha);
        $this->setMedicoId($medico_id);
        $this->setPacienteId($paciente_id);
        $this->setCreatedAt($created_at);
        $this->setUpdatedAt($updated_at);
    }

    // Getters y Setters para cada propiedad
    public function getId() { return $this->id; }
    public function setId($id) { $this->id = $id; }

    public function getFecha() { return $this->fecha; }
    public function setFecha($fecha) { $this->fecha = $fecha; }

    public function getMedicoId() { return $this->medico_id; }
    public function setMedicoId($medico_id) { $this->medico_id = $medico_id; }

    public function getPacienteId() { return $this->paciente_id; }
    public function setPacienteId($paciente_id) { $this->paciente_id = $paciente_id; }

    public function getCreatedAt() { return $this->created_at; }
    public function setCreatedAt($created_at) { $this->created_at = $created_at; }

    public function getUpdatedAt() { return $this->updated_at; }
    public function setUpdatedAt($updated_at) { $this->updated_at = $updated_at; }
}
?>
