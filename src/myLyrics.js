// ==UserScript==
// @name        Lyrics163
// @namespace   Lyrics163
// @description Lyrics163
// @include     http://music.163.com/*
// @require     http://ajax.aspnetcdn.com/ajax/jquery/jquery-1.7.2.js
// @version     1
// @grant       none
// ==/UserScript==

var gsInitFontColor = "green";
var gsInitBackColor = "black";
var gsInitFontSize = "30";
var gsInitFontLeft = "27";
var gsInitFontBottom = "1";

var sTextID = "myTextID";
var asLyrics = new Array();
var iLyricsIndex = 0;
var gasData = new Array(gsInitFontColor, gsInitBackColor, gsInitFontSize, gsInitFontLeft, gsInitFontBottom);

window.onload = init;

function init()
{
    waitForKeyElements("p.j-item.z-sel", showLyrics);
    //waitForKeyElements("p.j-item", saveLyrics);
    
    updateSetting();
}

function updateSetting()
{    
    chrome.storage.local.get('urlData', function(items) {
        gasData = items.urlData;
    });
}

function getTextHtml(sText)
{
    var asData = gasData;    
    //alert( "DATA:" + asData );

    // data order:　gsFontColor, gsBackColor, gsFontSize, gsFontLeft, gsFontBottom
    return "<div id='" + sTextID + "' style='font-family:Microsoft JhengHei, Microsoft YaHei; font-size:" + asData[2] + "px; color:" + asData[0] + "; background:" + asData[1] + "; position:fixed; bottom:" + asData[4] + "%; left:" + asData[3] + "%; z-index:999999900'>&nbsp;" + sText + "&nbsp;</div>";
}

function setText(sText)
{
    $("body").prepend(getTextHtml(sText));
}

function saveLyrics(jNode)
{
    asLyrics[asLyrics.length] = jNode.html();
    
    if (asLyrics.length == 2)
    {
        setText(asLyrics[0], 0);
        setText(asLyrics[1], 1);
    }
    
    if (jNode.attr('class').indexOf("z-sel") > 0)
    {
        alert(jNode.html());
    }
}

function showLyrics(jNode)
{
    updateSetting();
    
    if (iLyricsIndex == 0)
    {
        setText(jNode.html());
    }
    else
    {
        $("#" + sTextID).html(getTextHtml(jNode.html()));
    }
    iLyricsIndex++;
}








/*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/
function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}


