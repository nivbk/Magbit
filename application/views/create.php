<!-- Home -->
        <div data-role="page" id="page1">
            <div data-theme="a" data-role="header">
                <h3>
                    Payboxx
                </h3>
            </div>
            <div data-role="content">
                <form id="new_event" action="" method="post">
                    <div data-role="fieldcontain">
                        <label for="name">
                            Event Name
                        </label>
                        <input name="name" id="name" placeholder="" value="" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                        <label for="description">
                            Description
                        </label>
                        <input name="description" id="description" placeholder="" value="" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                       <label for="date">
                        Date
                       </label>

                    <input name="date" id="date" type="date" data-role="datebox" data-options='{"mode": "calbox", "calShowWeek": true}' />
                    </div>
                    <div data-role="fieldcontain">
                    <label for="time">
                        Event Time
                    </label>

                <input name="time" id="time" type="date" data-role="datebox" placeholder="" data-options='{"mode": "timebox", "overrideTimeFormat": 12}'>
                    </div>

                 <div data-role="fieldcontain">
                       <label for="due_date">
                        Due Date
                       </label>

                    <input name="due_date" id="due_date" type="date" data-role="datebox" data-options='{"mode": "calbox", "calShowWeek": true}' />
                    </div>

                    <div data-role="fieldcontain">
                        <label for="location">
                            Location
                        </label>
                        <input name="location" id="location" placeholder="" value="" type="text" />
                    </div>
                
                    <div data-role="fieldcontain">
                        <label for="total">
                            Total
                        </label>
                        <input name="total" id="total" placeholder="" value="" type="text" />
                    </div>
               
                <div data-role="fieldcontain">
                    <label for="searchinput1">
                        Friends list
                    </label>
                    <!--<input name="" id="searchinput1" placeholder="" value="Add friend " data-mini="true" type="search" />-->
                </div>
                <!--<select name="friends" id="friends" data-native-menu="false" data-mini="true" multiple="multiple">-->
                <ul data-role="listview" data-divider-theme="b" data-filter="true" data-filter-placeholder="Search a friend">
                    <li data-role="list-divider" role="heading">
                        Friends
                    </li>
                    <?php foreach ($app_friends as $friend) {
                        echo '<li class="friend">
                                        <a href="#page1" data-transition="slidedown" class="friend">   
                                            <img class="friend-pic" src="'.$friend['pic_square'].'" alt="'.$friend['name'].'">
                                            '.$friend['name'].'
                                            <span class="ui-li-count">
                                                Invite
                                            </span>
                                        </a>
                            </li>';
                    }?>
                </ul>
                <!--</select>-->
                <input value="Create" onClick="submit_event();" type="button" />
            </div>
             </form>
        </div>
