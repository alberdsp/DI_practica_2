<?php

/**
 *   ABF 2023
 *  clase Medico, contiene los datos esenciales de un Medico
 * 
 */



class Medico {
    private $id;
    private $numero_colegiado;
    private $dni;
    private $nombre;
    private $telefono;
    

    // Constructor
    public function __construct($id, $numero_colegiado, $dni, $nombre, $telefono) {
        $this->setId($id);
        $this->setNumeroColegiado($numero_colegiado);
        $this->setDni($dni);
        $this->setNombre($nombre);
        $this->setTelefono($telefono);
    
    }

    // Getters y Setters
    public function getId() { return $this->id; }
    public function setId($id) { $this->id = $id; }

    public function getNumeroColegiado() { return $this->numero_colegiado; }
    public function setNumeroColegiado($numero_colegiado) { $this->numero_colegiado = $numero_colegiado; }

    public function getDni() { return $this->dni; }
    public function setDni($dni) { $this->dni = $dni; }

    public function getNombre() { return $this->nombre; }
    public function setNombre($nombre) { $this->nombre = $nombre; }

    public function getTelefono() { return $this->telefono; }
    public function setTelefono($telefono) { $this->telefono = $telefono; }

}
?>
