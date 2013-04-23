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
                    <input name="" id="searchinput1" placeholder="" value="Add friend " data-mini="true" type="search" />
                </div>
                <ul data-role="listview" data-divider-theme="b" data-inset="true">
                    <li data-role="list-divider" role="heading">
                        Friends
                    </li>
                    <li data-theme="">
                        <a href="#page1" data-transition="slidedown">
                            Friend2
                            <span class="ui-li-count">
                                Invite
                            </span>
                        </a>
                    </li>
                    <li data-theme="c">
                        <a href="#page1" data-transition="slide">
                            Friend2
                            <span class="ui-li-count">
                                Invite via Facebook
                            </span>
                        </a>
                    </li>
                </ul>
                <input value="Create" onClick="submit_event();" type="button" />
            </div>
             </form>
        </div>
