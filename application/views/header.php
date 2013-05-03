<html>
<head>
	<meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <title>
        </title>
       

        <link rel="stylesheet" type="text/css" href="http://code.jquery.com/mobile/latest/jquery.mobile.min.css" />
        <link rel="stylesheet" type="text/css" href="http://dev.jtsage.com/cdn/datebox/latest/jqm-datebox.min.css" /> 
        <style type="text/css">
        li.friend {
            min-height: 60px;
        }
        a.friend {
            padding:20px 0px 0px 72px !important;
            min-height: 39px !important;
        }
        .friend-pic {
            position: absolute;
            top: 5px;
            left: 12px;
            border-radius: 5px;
        }

	label.error { 
	float: left; 
	color: red; 
	padding-top: .5em; 
	vertical-align: top; 
	font-weight:bold
	}	

        </style>

        <script type="text/javascript" src="http://code.jquery.com/jquery-1.7.1.min.js"></script> 
        <script type="text/javascript" src="http://code.jquery.com/mobile/latest/jquery.mobile.min.js"></script>

        <!-- Optional Mousewheel support: http://brandonaaron.net/code/mousewheel/docs -->
        <script type="text/javascript" src="PATH/TO/YOUR/COPY/OF/jquery.mousewheel.min.js"></script>

        <script type="text/javascript" src="http://dev.jtsage.com/cdn/datebox/latest/jqm-datebox.core.min.js"></script>
        <script type="text/javascript" src="http://dev.jtsage.com/cdn/datebox/latest/jqm-datebox.mode.calbox.min.js"></script>
        <script type="text/javascript" src="http://dev.jtsage.com/cdn/datebox/i18n/jquery.mobile.datebox.i18n.en_US.utf8.js"></script>
        <script type="text/javascript" src="http://dev.jtsage.com/cdn/datebox/latest/jqm-datebox.mode.datebox.min.js"></script>
    
        
        
    <script>
        function click_new() {

            $.mobile.changePage( "create_controller", { 
                transition: "slideup"}

             );

        }
    </script>
    <script>
        function submit_event() {
                $.mobile.changePage( 
                    "new_event_controller", 
                    {   
                        transition: "slideup", 
                        type: "post",
                        data: $("form#new_event").serialize() 
                    } 
                );


        }
    </script>

<script>
        function click_home() {

            $.mobile.changePage( "welcome", { 
                transition: "slideup"}

             );

}
</script>
 



        <style>
        </style>
        <!-- User-generated js -->
        <script>
            try {

    $(function() {

    });

  } catch (error) {
    console.error("Your javascript has an error: " + error);
  }
        </script>
    </head>
</head>
<body>
    <div class="content">
	
