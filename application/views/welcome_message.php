<div data-role="page" id="page1">
    <div data-theme="a" data-role="header">
        <a onClick="click_new();" class="ui-btn-right" type="button">
            New
        </a>
        <h3>
            Payboxx
        </h3>
        <div data-role="fieldcontain">
            <input name="" id="searchinput1" placeholder="" value="" type="search" />
        </div>
        <ul data-role="listview" data-divider-theme="b" data-inset="true">
            <li data-role="list-divider" role="heading">
                Own by me
            </li>
            <li data-theme="c">
                <a href="#page1" data-transition="slide">
                    My event 1
                </a>
            </li>
            <li data-role="list-divider" role="heading">
                Own by friend
            </li>
            <li data-theme="c">
                <a href="#page1" data-transition="slide">
                    Friend 1 event
                </a>
            </li>
            <li data-theme="c">
                <a href="#page1" data-transition="slide">
                    Friend 2 event
                </a>
            </li>
        </ul>
    </div>
    <div data-role="content">
    </div>
</div>