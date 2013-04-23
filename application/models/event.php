<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class event extends CI_Model
{
	var $user_table; // The user table (prefix + config)
	var $group_table; // The group table (prefix + config)
	
	public function __construct()
	{
		parent::__construct();

		//log_message('debug', 'Auth Model Loaded');
		
		//$this->config->load('ag_auth');
		$this->load->database();

		$this->user_table = 'events';
		//$this->group_table = $this->config->item('auth_group_table');
	}


public function insert_into_db()
	{
		//var_dump($_POST['name']);
		//die();
		$name = $_POST['name'];
		$description = $_POST['description'];
		$date = $_POST['date'];
		$location = $_POST['location'];
		//$per_user = $_POST[''];
		$total = $_POST['total'];
		return ($this->db->query("INSERT INTO events VALUES(
			'','$name','$description','$date','$due_date','$location','$division_method','$owner','$payment','$total');"));
/*
		return ($this->db->set('name', 
			$name)->set('description', $description)->set(
			'date', $date)->set('location', '$location')->set('total','$total')->insert($this->events));*/

	}

}