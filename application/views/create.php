<!-- Home -->
        <div data-role="page" id="page1">
            <div data-theme="a" data-role="header">
                <h3>
                    Payboxx
                </h3>
            </div>
            <div data-role="content">
                <form action="">
                    <div data-role="fieldcontain">
                        <label for="textinput1">
                            Event title
                        </label>
                        <input name="" id="textinput1" placeholder="" value="" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                        <label for="textinput2">
                            Description
                        </label>
                        <input name="" id="textinput2" placeholder="" value="" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                        <label for="textinput3">
                            When
                        </label>
                        <input name="" id="textinput3" placeholder="" value="" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                        <label for="textinput4">
                            Where
                        </label>
                        <input name="" id="textinput4" placeholder="" value="" type="text" />
                    </div>
                    <div data-role="fieldcontain">
                        <label for="toggleswitch1">
                            Per User
                        </label>
                        <select name="toggleswitch1" id="toggleswitch1" data-theme="" data-role="slider">
                            <option value="off">
                                Off
                            </option>
                            <option value="on">
                                On
                            </option>
                        </select>
                    </div>
                    <div data-role="fieldcontain">
                        <label for="textinput5">
                            Amount
                        </label>
                        <input name="" id="textinput5" placeholder="" value="" type="text" />
                    </div>
                </form>
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
                <input value="Create" type="submit" />
            </div>
        </div>
