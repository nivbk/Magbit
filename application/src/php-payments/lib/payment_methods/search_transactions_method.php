<?php

class Search_Transactions_Method implements Payment_Method
{
	private $_params;

	private $_description = "Search transactions previously submitted to the gateway by a set of criteria.";

	public function __construct()
	{
		$this->_params = array(
			'start_date'			=>	'2011-07-02T00:24:59+00:00',	//REQUIRED.  Date to search from.
			'end_date'				=>	'2012-07-02T00:24:59+00:00',	//Date to search to
			'email'					=>	'calvinsemail@gmail.com',	//Email used by purchaser
			'receiver'				=>	'293023',	//Identifier of receiver
			'receipt_id'			=>	'23929',	//Receipt id (generated by gateway)
			'transaction_id'		=>	'23929232',	//Transaction id (generated by gateway)
			'inv_num'				=>	'23239',	//Invoice number (generated by you, must match what's in gateway)
			'cc_number'				=>	'4111111111111111',	//The credit card number to use
			'transaction_class'		=>	'DoDirectPayment',	//The transaction class (Method of original API query)
			'amt'					=>	'25.00',	//Transactions of amount..
			'currency_code'			=>	'USD',	//Transactions with currency code..
			'status'				=>	'',	//Transactions with status
			'salutation'			=>	'Mr.',	//The buyer's salutation
			'first_name'			=>	'Calvin',	//The buyer's first name
			'middle_name'			=>	'P',	//The buyer's middle name
			'last_name'				=>	'Froedge',	//The buyer's last name
			'suffix'				=>	'PIMP'	//The buyer's suffix			
		);
	}

	public function get_params()
	{
		return $this->_params;
	}

	public function get_description()
	{
		return $this->_descrip;
	}
}