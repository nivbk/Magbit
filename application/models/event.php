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
		$date = explode("/",$_POST['date']);
		$date = strftime("%Y-%m-%d",mktime(0,0,0,$date[1],$date[0],$date[2])); 
		$due_date = explode("/",$_POST['due_date']);
		$due_date = strftime("%Y-%m-%d",mktime(0,0,0,$due_date[1],$due_date[0],$due_date[2])); 
		$name = $_POST['name'];
		$description = $_POST['description'];
		//$date = $_POST['date'];
		$time = $_POST['time'];
		$location = $_POST['location'];
		$total = $_POST['total'];
		$invited = $_POST['appfirends'];
		$payment = 0; //currently only one option in which each user pay fixed amount
		//ob_start();
		//var_dump($_POST);
		//$vdump = ob_get_clean();
		//log_message('debug', var_export($_POST));
		//die();

		$this->db->query("INSERT INTO events VALUES('','$name','$description','$date','$time','$due_date','$location','$owner','$payment','$total');");
		$event_id= $this->db->insert_id();
		foreach ($invited as $friend) {
			$time = time();
			$this->db->query("INSERT INTO transactions VALUES('','$event_id','$friend','$total','','$time','0');");
		}
	}
}