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


public function insert_into_db($owner)
	{
		
		$name = $_POST['name'];
		$description = $_POST['description'];
		$date = $_POST['date'];
		$time = $_POST['time'];
		$due_date=$_POST['due_date'];
		$location = $_POST['location'];
		$total = $_POST['total'];
		return ($this->db->query("INSERT INTO events VALUES(
			'','$name','$description','$date','$time','$due_date','$location','$owner','$payment','$total');"));


	}

}