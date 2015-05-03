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
var gsFontSecondLeft = "30";
var gsFontSecondBottom = "5";
var gsPlayerOffset = "60";
var gbBackTransparent = false;
var gbDownloadLink = false;

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
    updateSetting();
    
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
    var iEarlyOffset = 0; // show each lyrics earlier for 1 second

    iTotalSecond += iEarlyOffset;
    
    if (iTotalSecond < (3 + iEarlyOffset)) // has not played or change to new song
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
    
    if (!gasLyrics.length || gasLyrics.length < (iNowIndex))
    {
        return; // lyrics is not existed
    }
    
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
        //aeDiv[i].addEventListener('click', handleDownloadLink);
    }
}

function handleDownloadLink()
{
    var eDiv = document.getElementById("divDownload");
    
    if (eDiv)
    {
        eDiv.innerHTML = "";
    }
    
    if (gbDownloadLink)
    {
        parseTrackQueue();
        addDownloadLink();
    }
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
        
        handleDownloadLink(); // get the download link if the song is changed
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
            var sToken = asTemp[i].replace(/\\n/g, "").split("\",\"")[0];
            
            if (sToken && sToken != "")
            {
                gasLyrics[gasLyrics.length] = sToken;
                gasTime[gasTime.length] = asTemp[i-1];
            }
        }

        layoutText("", false); // clear the first lyrics
        
        if (gasLyrics.length)
        {   
            layoutText(gasLyrics[0], true); // set the second lyrics
        }
        else
        {
            layoutText("", true); // clear the second lyrics
        }
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
        gsFontSecondLeft = response.fontSecondLeft;
        gsFontSecondBottom = response.fontSecondBottom;
        gsPlayerOffset = response.playerOffset;
        gbBackTransparent = response.backTransparent;
        gbDownloadLink = response.downloadLink;
        
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
    var sFontLeft = bSecond ? gsFontSecondLeft : gsFontLeft;
    var sFontBottom = bSecond ? gsFontSecondBottom : gsFontBottom;
    var sID = bSecond ? gsSecondID : gsFirstID;
    var sColor = bSecond ? getDarkColor(gsFontColor, 30) : gsFontColor;
    
    return "<div id='" + sID + "' style='font-family:Microsoft JhengHei, Microsoft YaHei; font-size:" + gsFontSize + "px; color:" + sColor + "; background:" + gsBackColor + "; position:fixed; bottom:" + sFontBottom + "%; left:" + sFontLeft + "%; z-index:999999900'>&nbsp;" + sText + "&nbsp;</div>";
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

