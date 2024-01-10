<?php

/**
 *   ABF 2023
 *  clase Medico, contiene los datos esenciales de un Medico
 * 
 */


 class Medico
 {
     private $id;
     private $numero_colegiado;
     private $dni;
     private $nombre;
     private $telefono;
 
     // Constructor
     function __construct($id = null, $numero_colegiado = null, $dni = null, $nombre = null, $telefono = null)
     {
         if (func_num_args() > 0) {
             $this->id = $id;
             $this->numero_colegiado = $numero_colegiado;
             $this->dni = $dni;
             $this->nombre = $nombre;
             $this->telefono = $telefono;
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
 
     //  Obtener todos los medicos de la base de datos filtrando y poniendo limites
     public static function obtenerMedicos($pdo, $filtros = [])
     {
         // Similar to obtenerPacientes, but replace "pacientes" with "medicos"
     }
 
     // Actualizar datos del medico en la base de datos, si no existe lo crea
     public static function actualizar($pdo, $medico)
     {
         // Similar to actualizar, but replace "pacientes" with "medicos"
     }
 
     // función para eliminar medico y todas sus foreing keys
     public static function eliminar($pdo, $dni)
     {
         // Similar to eliminar, but replace "pacientes" with "medicos"
     }
 
     // localizar medico para editar datos por dni
     public static function obtenerMedicoPorDni($pdo, $dni)
     {
         // Similar to obtenerPacientePorDni, but replace "pacientes" with "medicos"
     }
 
     // Convertir objeto a JSON
     public function toJson()
     {
         return json_encode(get_object_vars($this));
     }
 
     // Crear un objeto Medico desde JSON
     public static function fromJson($jsonString)
     {
         $data = json_decode($jsonString, true);
         return new self($data['numero_colegiado'], $data['dni'], $data['nombre'], $data['telefono']);
     }
 }