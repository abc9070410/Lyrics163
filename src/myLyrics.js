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

var gsFirstID = "myTextID1";
var gsSecondID = "myTextID2";
var gasLyrics = new Array();
var gasTime = new Array();
var giLyricsIndex = 0;

var gasSongUrl = new Array();
var gasSongTitle = new Array();
var gasSongArtist = new Array();
var gasSongAlbum = new Array();
var gsPrevious = "";
var gsNowSongID = null;

//window.onload = init;

init();

function init()
{
    //waitForKeyElements("p.j-item.z-sel", showLyrics);
    //waitForKeyElements("p.j-item", saveLyrics);
    //waitForKeyElements("[tag$=_j-item]", saveLyrics);

    //waitForKeyElements("li.js-iparent.z-sel", getNowLyrics);
    
    
    updateSetting();

    //parseTrackQueue();
    //addDownloadLink();
    
    detectPlay();
    
    window.setInterval(updateLyrics, 1000); 
}

function updateLyrics()
{

    var eDiv = document.getElementsByClassName("j-flag time")[0];
    
    if (!eDiv)
    {
        return;
    }
    
    var sHTML = eDiv.innerHTML;
    
    var iBegin = sHTML.indexOf("<em>") + 4;
    var iEnd = sHTML.indexOf("</em>");
    
    if (iBegin < 4 || iEnd < iBegin)
    {
        alert("B&E:" + iBegin + "," + iEnd);
        return;
    }
    
    var asTime = sHTML.substring(iBegin, iEnd).split(":");
    
    //alert(asTime);

    var iTotalSecond = parseInt(asTime[0]) * 60 + parseInt(asTime[1]);
    
    if (iTotalSecond < 3) // has not played or change to new song
    {
        parseNowSong();
    }
    
    //alert(iTotalSecond);
    var iNowIndex = getNowLyricsIndex(iTotalSecond);
    
    if (iNowIndex < 0)
    {
        return; // not match
    }
    
    updateSetting();
    
    layoutText(gasLyrics[iNowIndex], false);
    
    if (gasLyrics.length > iNowIndex + 1)
    {
        layoutText(gasLyrics[iNowIndex+1], true);
    }
}

function detectPlay()
{
    var aeDiv = document.getElementsByClassName("ply");
    //alert(aeDiv.length);
    for (var i = 0; i < aeDiv.length; i ++)
    {
        aeDiv[i].addEventListener('click', clickPlayButton);
    }
}

function clickPlayButton()
{
    var eDiv = document.getElementById("divDownload");
    
    if (eDiv)
    {
        eDiv.innerHTML = "";
    }

    parseTrackQueue();
    addDownloadLink();
    parseNowSong();
}

function getNowSongID()
{
    var eDiv = document.getElementsByClassName("f-thide name fc1 f-fl")[0];
    
    if (!eDiv)
    {
        return;
    }
    
    var sID = eDiv.href.split("=")[1];
    
    return sID;
}

function songIsChanged()
{
    return gsNowSongID != getNowSongID();
}

function parseNowSong()
{
    var sID = getNowSongID();
    
    if (sID != gsNowSongID)
    {
        //alert("ID:" + sID + "," + gsNowSongID);
        clearLyrics();
        gsNowSongID = sID;
        parseLyrics(sID); // send a XHR request to get the lyrics
    }
}

function addDownloadLink()
{
    var sHTML = "<div id='divDownload' style='font-family:Microsoft JhengHei, Microsoft YaHei; font-size:" + 14 + "px; color:" + gsFontColor + "; position:fixed;     overflow-y:auto; top:" + 20 + "%; left:" + 0 + "%; z-index:999999900; max-width:50%; max-height:70%;'>";
    
    sHTML += "<fieldset><legend>MP3</legend>";

    
    for (var i = 0; i < gasSongUrl.length; i ++)
    {
        sHTML += getDownloadHTML(gasSongUrl[i], gasSongArtist[i] + "_" + gasSongTitle[i], gasSongTitle[i]);
        //sHTML += "<br>";
    }

    sHTML += "</fieldset></div>";
    
    //alert(sHTML);
    
    
    
    $("body").prepend(sHTML);
}

function getDownloadHTML(sUrl, sFileName, sTitle)
{
    var iMax = 7;
    if (sTitle.length > iMax)
    {
        sTitle = sTitle.substring(0, iMax);
    }

    return "<a type='button' id='downloadID' href='" + sUrl + "' download='" + sFileName + "'><p style='line-height: 180%;'>" + sTitle + "&nbsp;</p></a>";
}

function parseTrackQueue()
{
    var asToken = localStorage.getItem("track-queue").split(/\"/);
    var asUrl = new Array();
    var asTitle = new Array();
    var asArtist = new Array();
    var asAlbum = new Array();
    var index = 0;
    
    var STATE_INIT = 0;
    var STATE_URL_GET = 1;
    var STATE_TITLE_GET = 2;
    var STATE_ARTIST_GET = 3;
    var STATE_ALBUM_GET = 4;
    var iParseState = STATE_INIT;
    
    asToken = JSON.parse(localStorage.getItem("track-queue"));
    for (var i = 0; i < asToken.length; i ++)
    {
        asUrl[i] = asToken[i]["mp3Url"];
        asTitle[i] = asToken[i]["name"];
        asArtist[i] = asToken[i]["artists"][0]["name"];
        asAlbum[i] = asToken[i]["album"]["name"];
    }
    
    //alert(asUrl);
    
    //alert(asTitle + asArtist + asAlbum);
    
    gasSongUrl = asUrl;
    gasSongTitle = asTitle;
    gasSongArtist = asArtist;
    gasSongAlbum = asAlbum;
    
}

function clearLyrics()
{
    gasLyrics = new Array(); // clear the previous lyrics
    gasTime = new Array();
    giLyricsIndex = 0;
}

function getNowLyrics(jNode)
{
    clearLyrics();

    var sTemp = jNode.html();
    
    var iBegin = sTemp.indexOf("songlist-") + 9;
    var iEnd = sTemp.indexOf("\"", iBegin);
    var sID = sTemp.substring(iBegin, iEnd);
    
    parseLyrics(sID); // send a XHR request to get the lyrics
}

function parseLyrics(sID)
{    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = storeLyrics;
    xhr.open("GET", "http://music.163.com/api/song/media?id=" + sID + "&version=0&csrf_token=", true);
    xhr.send();
}

function storeLyrics()
{
    if (this.readyState == 4)
    {
        //alert(this.responseText);
        
        if (songIsChanged())
        {
            alert("song is changed");
            return;
        }
        
        var asTemp = this.responseText.split(/\[|\]/);
        
        for (var i = 2; i < asTemp.length; i += 2)
        {
            var sToken = asTemp[i].replace(/\\n/g, "");
            
            if (sToken && sToken != "")
            {
                gasLyrics[gasLyrics.length] = sToken;
                gasTime[gasTime.length] = asTemp[i-1];
            }
        }
        
        //alert(this.responseText);// + "___" + gasLyrics);
        
        layoutText("", false); // set the first lyrics (none)
        layoutText(gasLyrics[0], true); // set the second lyrics
    }
}

function getNowLyricsIndex(sTotalSecond)
{
    var iMinute = parseInt(sTotalSecond / 60);
    var iSecond = parseInt(sTotalSecond) % 60;
    //var f = (parseFloat(sTotalSecond) * 1000) % 1000;
    
    iSecond = iSecond < 10 ? "0" + iSecond : iSecond;
    iMinute = iMinute < 10 ? "0" + iMinute : iMinute;
    
    var sTime = iMinute + ":" + iSecond;
    
    for (var i = 0; i < gasTime.length; i ++)
    {
        if (gasTime[i].indexOf(sTime) == 0)
        {
            return i;
        }
    }
    
    //alert("WRONG TIME: [" + sTime + "]");
    
    return -1;
}

function showLyrics(jNode)
{
    updateSetting();
    
    var iNowIndex = getNowLyricsIndex(jNode.attr("data-time"));
    
    if (iNowIndex < 0)
    {
        return; // not match
    }
    
    layoutText(gasLyrics[iNowIndex], false);
    
    if (gasLyrics.length > iNowIndex + 1)
    {
        layoutText(gasLyrics[iNowIndex+1], true);
    }
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
        setIconEnable();
    });
}

function setIconEnable()
{
    chrome.extension.sendMessage({
        msg: "SetIcon",
    }, function(response) {
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


function componentToHex(c) 
{
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function getDarkColor(hex, iOffset)
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    if (result)
    {
        var r = parseInt(result[1], 16) - iOffset;
        var g = parseInt(result[2], 16) - iOffset;
        var b = parseInt(result[3], 16) - iOffset;
        
        r = r > 0 ? r : 0;
        g = g > 0 ? g : 0;
        b = b > 0 ? b : 0;
        
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    
    return null;
}


function getTextHtml(sText, bSecond)
{
    var iLeftOffset = bSecond ? 3 : 0;
    var iBottomOffset = bSecond ? 8 : 0;
    var sID = bSecond ? gsSecondID : gsFirstID;
    var sColor = bSecond ? getDarkColor(gsFontColor, 30) : gsFontColor;
    
    return "<div id='" + sID + "' style='font-family:Microsoft JhengHei, Microsoft YaHei; font-size:" + gsFontSize + "px; color:" + sColor + "; background:" + gsBackColor + "; position:fixed; bottom:" + (parseInt(gsFontBottom) + iBottomOffset) + "%; left:" + (parseInt(gsFontLeft) + iLeftOffset) + "%; z-index:999999900'>&nbsp;" + sText + "&nbsp;</div>";
}

function layoutText(sText, bSecond)
{
    if (existText(bSecond))
    {
        var sID = bSecond ? gsSecondID : gsFirstID;
        $("#" + sID).html(getTextHtml(sText, bSecond));
    }
    else
    {
        $("body").prepend(getTextHtml(sText, bSecond));
    }
}

function existText(bSecond)
{
    var sID = bSecond ? gsSecondID : gsFirstID;
    return $("#" + sID).length;
}




function copyTextToClipboard(text) 
{
    var copyFrom = $('<textarea/>');
    copyFrom.id = "copyFrom";
    copyFrom.text(text);
    $('body').append(copyFrom);
    copyFrom.select();
    document.execCommand('copy', true);
    copyFrom.remove();

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


