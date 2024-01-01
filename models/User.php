<?php


/**
 *   ABF 2023
 *  clase User, contiene los datos esenciales de usuario
 * 
 */

class User
{
    private $id;
    private $name;
    private $email;
    private $remember_token;  // será el token que usaremos para las peticiones una vez logueados
    private $password;

    // Constructor
    public function __construct($id, $name, $email, $remember_token, $password)
    {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->remember_token = $remember_token;
        $this->password = $password;
    }

    // Getters and setters

    public function getId()
    {
        return $this->id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function getRememberToken()
    {
        return $this->remember_token;
    }

    public function getPassword()
    {
        return $this->password;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function setEmail($email)
    {
        $this->email = $email;
    }

    public function setRememberToken($remember_token)
    {
        $this->remember_token = $remember_token;
    }

    public function setPassword($password)
    {
        $this->password = $password;
    }
}

