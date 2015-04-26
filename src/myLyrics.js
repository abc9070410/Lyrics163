// ==UserScript==
// @name        Lyrics163
// @namespace   Lyrics163
// @description Lyrics163
// @include     http://music.163.com/*
// @require     http://ajax.aspnetcdn.com/ajax/jquery/jquery-1.7.2.js
// @version     1
// @grant       none
// ==/UserScript==

"use strict";

var STYLE_RIGHT = 1;
var STYLE_BOTTOM = 2;
var STYLE_WIDTH = 3;

var gsFontColor = "green";
var gsBackColor = "black";
var gsFontSize = "30";
var gsFontLeft = "27";
var gsFontBottom = "0";
var gsPlayerOffset = "60";
var gbBackTransparent = false;

var sTextID = "myTextID";
var asLyrics = new Array();
var iLyricsIndex = 0;

//window.onload = init;

init();

function init()
{
    waitForKeyElements("p.j-item.z-sel", showLyrics);
    //waitForKeyElements("p.j-item", saveLyrics);
    
    updateSetting();

    // 1218 / 2 = 609
    // min: x / 2 - 800 = -191
    // max: x / 2 - 100 = 509
    // screenWidth / 2 - (x * 7 + 100)
}

function updateSetting()
{    
    chrome.extension.sendMessage({
        msg: "GetSetting",
        screenWidth: document.documentElement.clientWidth
    }, function(response) {
        gsFontColor = response.fontColor;
        gsBackColor = response.backColor;
        gsFontSize = response.fontSize;
        gsFontLeft = response.fontLeft;
        gsFontBottom = response.fontBottom;
        gsPlayerOffset = response.playerOffset;
        gbBackTransparent = response.backTransparent;
        
        changeLayout();
    });
}

function changeLayout()
{
    var iRightOffset = -gsPlayerOffset;
    var iRightOffsetLess = iRightOffset + 400;
    var iRightOffsetMore = iRightOffset - 40;
    
    changeStyle(document.getElementsByClassName("btns"), STYLE_RIGHT, iRightOffsetMore);
    changeStyle(document.getElementsByClassName("head"), STYLE_RIGHT, iRightOffset);
    changeStyle(document.getElementsByClassName("play"), STYLE_RIGHT, iRightOffset);
    changeStyle(document.getElementsByClassName("oper f-fl"), STYLE_RIGHT, iRightOffsetLess);
    changeStyle(document.getElementsByClassName("ctrl f-fl f-pr"), STYLE_RIGHT, iRightOffsetLess);
    
    //changeStyle(document.getElementsByClassName("play"), STYLE_WIDTH, 20);
    //changeStyle(document.getElementsByClassName("m-pbar"), STYLE_WIDTH, 80);
    
    var iBottomOffset = 10;
    changeStyle(document.getElementsByClassName("oper f-fl"), STYLE_BOTTOM, iBottomOffset);
    changeStyle(document.getElementsByClassName("ctrl f-fl f-pr"), STYLE_BOTTOM, iBottomOffset);
    changeStyle(document.getElementsByClassName("j-flag time"), STYLE_BOTTOM, iBottomOffset);
    
    //changeStyle(document.getElementsByClassName("list"), STYLE_BOTTOM, -50);
    //changeStyle(document.getElementById("g_playlist"), STYLE_BOTTOM, -50);
}

function changeStyle(aeDiv, iStyle, iOffset)
{
    for (var i = 0; i < aeDiv.length; i ++)
    {
        var eDiv = aeDiv[i];
        
        if (iStyle == STYLE_RIGHT)
        {
            eDiv.style.position = "relative";
            eDiv.style.right = iOffset + "px";
        }
        else if (iStyle == STYLE_BOTTOM)
        {
            eDiv.style.position = "relative";
            eDiv.style.bottom = iOffset + "px";
        }
        else if (iStyle == STYLE_WIDTH)
        {
            eDiv.style.position = "relative";
            eDiv.style.width = iOffset + "px";
        }
    }
}

function getTextHtml(sText)
{
    return "<div id='" + sTextID + "' style='font-family:Microsoft JhengHei, Microsoft YaHei; font-size:" + gsFontSize + "px; color:" + gsFontColor + "; background:" + gsBackColor + "; position:fixed; bottom:" + gsFontBottom + "%; left:" + gsFontLeft + "%; z-index:999999900'>&nbsp;" + sText + "&nbsp;</div>";
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


