<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Welcome extends CI_Controller {

	function __construct()
	{
		parent::__construct();		
		
		// The fb_ignited library is already auto-loaded so call the user and app.
		$this->fb_me = $this->fb_ignited->fb_get_me(true);		
		$this->fb_app = $this->fb_ignited->fb_get_app();
		// This is a Request System I made to be used to work with Facebook Ignited.
		// NOTE: This is not mandatory for the system to work.
		if ($this->fb_me)
		{
			$user = array(
				'fb_id' => $this->fb_me['id'], 
				'first_name' => $this->fb_me['first_name'],
				'last_name' => $this->fb_me['last_name']);
			$this->load->model('fb_requests_model');
			if(!($this->fb_requests_model->database_user_exists($user['fb_id']))) {
				$this->fb_requests_model->database_register($user);
			}
			
		}

	}

	function index($type="")
	{	
		if (isset($this->request_result))
		{
			$content_data['error'] = $this->request_result;
		}
		if ($this->fb_me)
		{
			$content_data['me'] = $this->fb_me;
		}

		$content_data['staff'] = $this->fb_ignited->api('/me?fields=id,name,about,email,installed,friends.fields(email,installed)');
//681226481?fields=id,name,about,email,installed,friends.fields(email,installed)
		$content_data['last_status'] = $this->fb_ignited->api('/me/feed?limit=5');
		$content_data['fb_app'] = $this->fb_app;
		$content_data['login_login'] = $this->fb_ignited->fb_login_url();
		$content_data['app_friends'] = $this->fb_ignited->fb_list_friends('uid,name,pic_square');
		$content_data['friends'] = $this->fb_ignited->fb_list_friends('uid,name,pic_square',"full");
		//$params = array('' => 'ronkrasn@gmail.com', );
		//$this->payments->payment_action('paypal_paymentspro', $params, $config);
		
		/*
		$query = $this->db->query('SELECT * FROM events WHERE owner=');

		foreach ($query->result() as $row)
		{
		    echo $row->title;
		    echo $row->name;
		    echo $row->email;
		}

		echo 'Total Results: ' . $query->num_rows(); 
		*/
		$content_data['owned_events'] = $this->get_owned_events();
		$content_data['invited_events'] = $this->get_invited_events();
		$this->load->view('header', $content_data);
		$this->load->view('welcome_message', $content_data);
		$this->load->view('footer', $content_data);  		
	}
	
	function view_feed() {
		
	}
	
	function callback()
	{
		// This method will include the facebook credits system.
		$content_data['message'] = $this->fb_ignited->fb_process_credits();
		$this->load->view('fb_credits_view', $content_data);
	}

	function get_owned_events ()
	{
		$this->load->database();
	    $this->db->select('*');
	    $this->db->select("DATE_FORMAT( date, '%W, %M %d, %Y' ) as date_human",  FALSE );
	    $this->db->select("DATE_FORMAT( time, '%H:%i') as time_human",      FALSE );


	    $this->db->from('events');

	    $this->db->where('owner', $this->fb_me['id'] );


	    $query = $this->db->get();
	    //echo "after query <br />\n";


	    if ( $query->num_rows() > 0 )
	    {
	        //$row = $query->row_array();
	        //var_dump($row);
	        //echo "<br />\n";	
	        $owned_events = array();
	        foreach ($query->result_array() as $row)
			{
				$owned_events[] = $row;
				/*
				echo "row <br />\n";
			    var_dump($row);
			    echo "<br />\n";
			    */
			}
	        return $owned_events;
	    }
	}

    function get_invited_events ()
	{
		$this->load->database();
	    $this->db->select('*');

	    $this->db->from('transactions');

	    $this->db->where('user_id', $this->fb_me['id'] );


	    $query = $this->db->get();
	    //echo "after query <br />\n";


	    if ( $query->num_rows() > 0 )
	    {
	        //$row = $query->row_array();
	        //var_dump($row);
	        //echo "<br />\n";	
	        $invited_events = array();
	        foreach ($query->result_array() as $row)
			{

				$invited_events[] = $this->load_invited_event($row['event_id']);
				/*
				echo "row <br />\n";
			    var_dump($row);
			    echo "<br />\n";
			    */
			}
	        return $invited_events;
	    }


	} 

	function load_invited_event($event_id) {
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
	

}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */
