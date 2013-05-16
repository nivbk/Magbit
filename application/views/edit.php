<!-- Home -->
        <div data-role="page" id="page1">
            <div data-theme="a" data-role="header">
                <h3>
                    Payboxx
                </h3>
            </div>
            <div data-role="content">
                <form id="new_event" action="" method="post">
                    <div style="display: none;"> 
                        <input disabled="disabled" name="id" id="id" placeholder="" value="<?php echo $event['id']; ?>" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                        <label for="name">
                            Event Name
                        </label>
                        <input name="name" id="name" placeholder="" value="<?php echo $event['name']; ?>" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                        <label for="description">
                            Description
                        </label>
                        <input name="description" id="description" placeholder="" value="<?php echo $event['description']; ?>" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                       <label for="date">
                        Date
                       </label>

                    <input name="date" id="date" type="date" data-role="datebox" value="<?php echo $event['date_pharse']; ?>" data-options='{"mode": "calbox", "calShowWeek": true, "overrideDateFormat": "%d/%m/%Y"}' />
                    </div>
                    <div data-role="fieldcontain">
                    <label for="time">
                        Event Time
                    </label>

                <input name="time" id="time" type="date" data-role="datebox" placeholder=""  value="<?php echo $event['time']; ?>" data-options='{"mode": "timebox", "overrideTimeFormat": 12,  "overrideTimeOutput":"%k:%M"}'>
                    </div>

                 <div data-role="fieldcontain">
                       <label for="due_date">
                        Due Date
                       </label>

                    <input name="due_date" id="due_date" type="date" data-role="datebox" value="<?php echo $event['due_date_pharse']; ?>" data-options='{"mode": "calbox", "calShowWeek": true, "overrideDateFormat": "%d/%m/%Y"}' />
                    </div>

                    <div data-role="fieldcontain">
                        <label for="location">
                            Location
                        </label>
                        <input name="location" id="location" placeholder="" value="<?php echo $event['location']; ?>" type="text" />
                    </div>
                
                    <div data-role="fieldcontain">
                        <label for="total">
                            Total
                        </label>
                        <input name="total" id="total" placeholder="" value="<?php echo $event['total']; ?>" type="text" />
                    </div>
               
                <div data-role="fieldcontain">
                    <label for="searchinput1">
                        Friends list
                    </label>
                    <!--<input name="" id="searchinput1" placeholder="" value="Add friend " data-mini="true" type="search" />-->
                </div>
                <!--<select name="friends" id="friends" data-native-menu="false" data-mini="true" multiple="multiple">-->
                <script>
                $('li.friend').live('vclick', function(event) {
                    event.preventDefault();
                    var checkboxId = 'check-'+$(this).data('friend-id');
                    var spanId = 'span-'+$(this).data('friend-id');
                    if (document.getElementById(checkboxId).checked) {
                        document.getElementById(checkboxId).checked = false;
                        $("#"+spanId).removeClass("invited")
                        $("#"+spanId).html("Invite");

                    }
                    else {
                        document.getElementById(checkboxId).checked = true;
                        $("#"+spanId).addClass("invited");
                        $("#"+spanId).html("Invited");
                    }
                    //console.log(isit);
                    //alert(elementType);
                });
                </script>
             
                <input value="Save" onClick="validate_event();" type="submit" />
                 <input value="Back" onClick="click_home();" type="button" />
            </div>
             </form>
        </div>
