<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


class new_event_controller extends CI_Controller {

	function __construct()
	{
		parent::__construct();		
		
	

	}

	function index($type="")
	{	
		$this->load->model('event');
		$this->fb_me = $this->fb_ignited->fb_get_me(true);
		$this->event->insert_into_db($this->fb_me['id']);
		$this->load->view('success');

	
   		
   		
	}
	
	function view_feed() {
		
	}
	
	function callback() {
		// This method will include the facebook credits system.
		$content_data['message'] = $this->fb_ignited->fb_process_credits();
		$this->load->view('fb_credits_view', $content_data);

	}

	function insert_to_db() {
		
		$this->load->model('event');
		$this->event->temp();
		$this->load->view('success');//loading success view
	
	}

}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */