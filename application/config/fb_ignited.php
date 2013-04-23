<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * --- Facebook Ignited ---
 * 
 * fb_appid		is the app id you recieved from dev panel
 * fb_secret	is the secret you recieved from dev panel
 * fb_canvas 	the value you put in 'Canvas Page' field in dev panel or the address of your app.
 *				See example below the config.
 * fb_apptype	set to either 'iframe' or 'connect' based on what platform your app is
 * 				is running on. 
 * fb_auth		is the default authentications, '' is basic authentication
 * fb_upload	tells the SDK whether or not file uploads are enabled on your server.
 */
$config['fb_appid']     = '412533895508798';
$config['fb_secret']    = 'cf10c435f57145118a244a3a12a356d8';
//$config['fb_canvas']    = 'http://localhost:8888/index.php' ;
$config['fb_canvas']    = 'http://127.0.0.1/index.php';
$config['fb_apptype']   = 'connect';
$config['fb_auth']      = '';
$config['fb_upload']    = false;
$config['fb_logexcept'] = true;
/**
 * --- fb_canvas examples ---
 * iframe		your-facebook-namespace 
 * connect		www.your-connect-domain.com/subfolder/
 */