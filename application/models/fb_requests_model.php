<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Fb_requests_model extends CI_Model
{
		public function __construct()
	{
		parent::__construct();

		log_message('debug', 'Fb Model Loaded');
		
		$this->config->load('fb_ignited');
		$this->load->database();

		//$this->user_table = $this->config->item('auth_user_table');
		//$this->group_table = $this->config->item('auth_group_table');
	}

	function database_insert($request_ids)
	{
		// This is an example function that will be called when you accept requests.
		// NOTE: You must have a database set to use this function!
		foreach ($request_ids as $value)
		{
			// Loops through each id and adds them into database if they don't already exists.
			$request_data = $this->fb_ignited->api('/'.$value);
			$user_id = $this->fb_ignited->getUser();
			$other_id = $request_data['from']['id'];			
			if ($request_data['from'])
			{
				$this->db->select('*')->from('user_friends')->where(array('id'=>$user_id, 'friend'=>$other_id));
				$query = $this->db->get();
				if ($query->num_rows() == 0)
				{
					$array = array(
						'id' => $user_id,
						'friend' => $other_id 
					);
					$this->db->insert('user_friends', $array);
				}
				$this->db->select('*')->from('user_friends')->where(array('id'=>$other_id, 'friend'=>$user_id));
				$query = $this->db->get();
				if ($query->num_rows() == 0)
				{
					$array = array(
						'id' => $other_id,
						'friend' => $user_id 
					);
					$this->db->insert('user_friends', $array);
				}	
			}
		}		
	}

	public function database_register($user)
	{
		$user['password'] = ''; 
		if(array_key_exists('email', $user) || !isset($user['email']))	
			$user['email'] = '';
		if(array_key_exists('username', $user) || !isset($user['username']))	
			$user['username'] = $user['first_name'].'.'.$user['last_name'];
		
		try {
			$result = $this->db->set(
			'fb_id', $user['fb_id'])->set(
			'username', $user['username'])->set(
			'first_name', $user['first_name'])->set(
			'last_name', $user['last_name'])->set(
			'password', $user['password'])->set(
			'email', $user['email'])->set(
			'group_id', '100')->insert('users');
		} catch (FacebookApiException $e) {
			throw new FBIgnitedException($e->getMessage(), $e, $this->globals['fb_logexcept']);
		}
		if($result) 
			return TRUE;
		else 
			return FALSE;
	}
	
	public function database_user_exists($value)
	{
		
		$field_name = 'fb_id';
		
		$query = $this->db->get_where('users', array($field_name => $value));
		if($query->num_rows() <> 0)
		{
			return TRUE;
		}
		
		return FALSE;
	}
}
