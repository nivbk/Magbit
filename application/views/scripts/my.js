//Navigation
$("#SITE ul li a").click( function(e){
        e.preventDefault();

        var sitename = $(this).attr('href').substr(1).strtolower(); //strtolower is a Prototype
        $('.content').fadeOut('slow', function(){
            $('.content').html('');
            $('.content').load(BASE_URL  + '127.0.0.1/index.php + sitename, function() {
                  
                    $('.content').fadeIn('slow', function(){     
                            //your Callback Function
                    });
            });
        });

        return false;
}); 


function click_new() {

$.mobile.changePage( "index.php/create", { transition: "slideup"} );

}