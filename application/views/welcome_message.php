<div data-role="page" id="page1">
    <div data-theme="a" data-role="header">
        <a onClick="click_new();" class="ui-btn-right" type="button">
            Create
        </a>
        <h3>
            PayBox
        </h3>
    </div>
    <div data-role="content">
        <ul data-divider-theme="d" data-theme="d" data-role="listview" data-filter="true" data-filter-placeholder="Search Event">
            <li data-divider-theme="a" data-theme="a" data-role="list-divider" role="heading">My Events<span class="ui-li-count"><?php echo count($owned_events);?></span></li>
            <?php foreach ($owned_events as $event) {
                echo '<li data-role="list-divider" role="heading">'.$event['date_human'].'<!--<span class="ui-li-count"></span>--></li>
                <li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="d" >
                    <a href="event/'.$event['id'].'" class="ui-link-inherit">
                        <p class="ui-li-aside ui-li-desc"><strong>'.$event['time_human'].'</strong></p>
                        <h3 class="ui-li-heading">'.$event['name'].'</h3>
                        <p class="ui-li-desc"><strong>'.$event['location'].'</strong></p>
                        <p class="ui-li-desc">'.$event['description'].'</p>
                    </a>
                </li>';
            }

            ?>
            <li data-divider-theme="a" data-theme="a" data-role="list-divider" role="heading">Events I'm Invited To<span class="ui-li-count"><?php echo count($invited_events);?></span></li>
            <?php foreach ($invited_events as $event) {
                echo '<li data-role="list-divider" role="heading">'.$event['date_human'].'<!--<span class="ui-li-count"></span>--></li>
                <li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="d" >
                    <a href="event/'.$event['id'].'" class="ui-link-inherit">
                        <p class="ui-li-aside ui-li-desc"><strong>'.$event['time_human'].'</strong></p>
                        <h3 class="ui-li-heading">'.$event['name'].'</h3>
                        <p class="ui-li-desc"><strong>'.$event['location'].'</strong></p>
                        <p class="ui-li-desc">'.$event['description'].'</p>
                    </a>
                    <a class="push-to-pay" data-event-sum="'.$event['total'].'" data-event-id="'.$event['id'].'" data-transition="pop" data-position-to="window" data-rel="popup" href="#pay" title="Pay for event" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-icon="false" data-iconpos="notext" data-theme="c" aria-haspopup="true" aria-owns="#pay"></a>
                </li>';
            }

            ?>
        </ul>
        <div style="max-width:340px;" class="ui-content" data-overlay-theme="b" data-theme="d" id="pay" data-role="popup" aria-disabled="false" data-disabled="false" data-shadow="true" data-corners="true" data-transition="none" data-position-to="origin">
            <h3>Pay for the event?</h3>
            <p>Your payment will transfer immediately to the event Paybox.</p>
            <a id="pay-link" data-mini="true" data-inline="true" data-icon="check" data-theme="b" data-rel="back" data-role="button" href="index.html" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" class="ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-icon-left ui-btn-up-b">
                <span class="ui-btn-inner ui-btn-corner-all">
                    <span id="pay-button" class="ui-btn-text">Pay: $10.99</span>
                    <span class="ui-icon ui-icon-check ui-icon-shadow">&nbsp;</span>
                </span>
            </a>
            <a id="pay-cancel" data-mini="true" data-inline="true" data-rel="back" data-role="button" href="" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c" class="ui-btn ui-btn-up-c ui-shadow ui-btn-corner-all ui-mini ui-btn-inline"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Cancel</span></span></a>    
        </div>
    </div>
</div>