<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


class create_controller extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		$this->fb_me = $this->fb_ignited->fb_get_me(true);
		

	}

	function index($type="")
	{	
	
		$content_data['app_friends'] = $this->fb_ignited->fb_list_friends('uid,name,pic_square');
		$this->load->view('header');
		$this->load->view('create', $content_data);
		$this->load->view('footer');
	
	}
	
	function view_feed() {
		
	}
	
	function callback() {
		// This method will include the facebook credits system.
		$content_data['message'] = $this->fb_ignited->fb_process_credits();
		$this->load->view('fb_credits_view', $content_data);

	}

	function event_lookup($event_id) {

		$content_data['event'] = $this->load_event($event_id);

		if ($this->check_owner($event_id)) {
		
			$this->load->view('header');
			$this->load->view('edit', $content_data);
			$this->load->view('footer');
		}

		else {

			$this->load->view('header');
			$this->load->view('view', $content_data);
			$this->load->view('footer');
		}



	}

	function load_event($event_id) {
		$this->load->database();
	    $this->db->select('*');
	    $this->db->select("DATE_FORMAT( date, '%W, %M %d, %Y' ) as date_human",  FALSE );
	    $this->db->select("DATE_FORMAT( date, '%d/%m/%Y' ) as date_pharse",  FALSE );
	    $this->db->select("DATE_FORMAT( due_date, '%d/%m/%Y' ) as due_date_pharse",  FALSE );
	    $this->db->select("DATE_FORMAT( time, '%H:%i') as time_human",      FALSE );

	    $this->db->from('events');

	    $this->db->where('id', $event_id );

	    $query = $this->db->get();
	    
	    $row = $query->row_array();
	    return $row;
	}

	function check_owner($event_id) {
		$this->load->database();
	    $this->db->select('owner');
	    $this->db->from('events');
	    $this->db->where('id', $event_id );
	    $this->db->where('owner', $this->fb_me['id']);

	    $query = $this->db->get();
	    
	    if ( $query->num_rows() > 0 )
	    	return true;
	    else
	    	return false;
	}

	function check_event_sum($event_id) {
		$this->load->database();
	    $this->db->select('total');
	    $this->db->from('events');
	    $this->db->where('id', $event_id );

	    $query = $this->db->get();
	    
	    if ( $query->num_rows() > 0 )
	    	$row = $query->row_array();
	    else
	    	$row['total'] = -1;

	    return $row['total'];
	}

	function get_transaction_status($event_id) {
		$this->load->database();
	    $this->db->select('id');
	    $this->db->select('status');
	    $this->db->from('transactions');
	    $this->db->where('event_id', $event_id );
	    $this->db->where('user_id', $this->fb_me['id'] );

	    $query = $this->db->get();
	    
	    if ( $query->num_rows() > 0 )
	    	$row = $query->row_array();
	    else
	    	$row['status'] = -1;

	    return $row;
	}



	function pay_for_event($event_id)
	{
		$trans = $this->get_transaction_status($event_id);
		$status = $trans['status'];
		if($status == 0) {
			$sum = $this->check_event_sum($event_id);
			$this->load->model('event');
			$this->event->update_transaction($trans['id'],$sum);
			return 1;
		}
		elseif($status == 1)
			return 1;
		elseif($status == -1)
			return -1;
	}

	/*function insert_to_db() {
		
		$this->load->model('event');
		$this->event->temp();
		//$this->load->view('success');//loading success view
	
	}*/

}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */