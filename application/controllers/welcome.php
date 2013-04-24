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
		//var_dump($content_data['staff']);
		//die();

		$content_data['last_status'] = $this->fb_ignited->api('/me/feed?limit=5');
		$content_data['fb_app'] = $this->fb_app;
		$content_data['login_login'] = $this->fb_ignited->fb_login_url();
		$content_data['app_friends'] = $this->fb_ignited->fb_list_friends('uid,name,pic_square');
		$content_data['friends'] = $this->fb_ignited->fb_list_friends('uid,name,pic_square',"full");
		$content_data['picture'] = $this->fb_ignited->api('https://graph.facebook.com/100001259320970?fields=id,picture');
		//var_dump($content_data['picture']);
		//die();
		$params = array('' => 'ronkrasn@gmail.com', );
		$this->payments->payment_action('paypal_paymentspro', $params, $config);

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
	

}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */