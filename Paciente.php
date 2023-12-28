<?php
class Paciente {
    private $id;
    private $nombre;
    private $edad;
    private $genero;

    // Constructor
    function __construct($id, $nombre, $edad, $genero) {
        $this->setId($id);
        $this->setNombre($nombre);
        $this->setEdad($edad);
        $this->setGenero($genero);
    }

    // Getters
    public function getId() {
        return $this->id;
    }

    public function getNombre() {
        return $this->nombre;
    }

    public function getEdad() {
        return $this->edad;
    }

    public function getGenero() {
        return $this->genero;
    }

    // Setters
    public function setId($id) {
        $this->id = $id;
    }

    public function setNombre($nombre) {
        $this->nombre = $nombre;
    }

    public function setEdad($edad) {
        $this->edad = $edad;
    }

    public function setGenero($genero) {
        $this->genero = $genero;
    }

    // Método para mostrar la información del paciente
    public function mostrar() {
        echo "ID del Paciente: " . $this->getId() . "\n";
        echo "Nombre: " . $this->getNombre() . "\n";
        echo "Edad: " . $this->getEdad() . "\n";
        echo "Género: " . $this->getGenero() . "\n";
    }
}
?>
