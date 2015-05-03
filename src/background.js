"use strict";

var gsInitFontColor = "#008000";
var gsInitBackColor = "#000000";
var gsInitFontSize = "34";
var gsInitFontLeft = "0";
var gsInitFontBottom = "0";
var gsInitFontSecondLeft = "5";
var gsInitFontSecondBottom = "7";
var gsInitPlayerOffset = "300";
var gbInitBackTransparent = false;
var gbInitDownloadLink = false;

var gsFontColor = gsInitFontColor;
var gsBackColor = gsInitBackColor;
var gsFontSize = gsInitFontSize;
var gsFontLeft = gsInitFontLeft;
var gsFontBottom = gsInitFontBottom;
var gsFontSecondLeft = gsInitFontSecondLeft;
var gsFontSecondBottom = gsInitFontSecondBottom;
var gsPlayerOffset = gsInitPlayerOffset;
var gbBackTransparent = gbInitBackTransparent;
var gbDownloadLink = gbInitDownloadLink;

var giScreenWidth = 0;
var gbOnRightPage = true;
var gTab = null;

initBackground();

function isOnRightPage(url)
{
    return url.indexOf("music.163.com") > 0;
}

function checkNowPage()
{
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var tab = chrome.tabs.get(arrayOfTabs[0].id, function(tab) {
            gbOnRightPage = isOnRightPage(tab.url);
        });
    });
}

function initBackground()
{
    checkNowPage();

    chrome.extension.onMessage.addListener(onMyMessage);
    chrome.tabs.onActivated.addListener(function(info) {
        var tab = chrome.tabs.get(info.tabId, function(tab) {     
            gbOnRightPage = isOnRightPage(tab.url);
            gTab = info.tabId;
            
            setIcon();
        });
    });

    chrome.storage.local.get('urlData', function(items) {
        var asData = items.urlData;
        
        if (asData && asData.length == 10) // stored the data before
        {
            //sFontColor, sBackColor, sFontSize, sFontLeft, sFontBottom 

            gsFontColor = asData[0];
            gsBackColor = asData[1];
            gsFontSize = asData[2];
            gsFontLeft = asData[3];
            gsFontBottom = asData[4];
            gsFontSecondLeft = asData[5];
            gsFontSecondBottom = asData[6];
            gsPlayerOffset = asData[7];
            gbBackTransparent = asData[8];
            gbDownloadLink = asData[9];
        }
        else // have not store the data yet
        {
        
        }
    });
}


function onMyMessage(details, sender, callback)
{
    if (details.msg == "SetSetting") {
        
        gsFontColor = details.fontColor;
        gsBackColor = details.backColor;
        gsFontSize = details.fontSize;
        gsFontLeft = details.fontLeft;
        gsFontBottom = details.fontBottom;
        gsFontSecondLeft = details.fontSecondLeft;
        gsFontSecondBottom = details.fontSecondBottom;
        gsPlayerOffset = details.playerOffset;
        gbBackTransparent = details.backTransparent;
        gbDownloadLink = details.downloadLink;
        
        var asData = new Array(gsFontColor, gsBackColor, gsFontSize, gsFontLeft, gsFontBottom, gsFontSecondLeft, gsFontSecondBottom, gsPlayerOffset, gbBackTransparent, gbDownloadLink);
        chrome.storage.local.set({'urlData':asData});

        //alert("FB:" + gsFontBottom);
        
        if (callback) {
            return true;
        }
    }
    else if (details.msg == "GetSetting") {
        checkNowPage();
        
        if (details.screenWidth) // request from the content script (myLyrics.js)
        {
            giScreenWidth = details.screenWidth;
            gsInitPlayerOffset = "" + (giScreenWidth / 2 - 100);
            //alert( giScreenWidth );
        }

        if (callback) {
            callback({
                fontColor: gsFontColor,
                backColor: gsBackColor,
                fontSize: gsFontSize,
                fontLeft: gsFontLeft,
                fontBottom: gsFontBottom,
                fontSecondLeft: gsFontSecondLeft,
                fontSecondBottom: gsFontSecondBottom,
                playerOffset: gsPlayerOffset,
                backTransparent: gbBackTransparent,
                downloadLink: gbDownloadLink,
                screenWidth: giScreenWidth,
                onRightPage: gbOnRightPage
            });
            
            return true;
        }
    }
    else if (details.msg == "GetInitSetting") {
        
        if (callback) {
            callback({
                fontColor: gsInitFontColor,
                backColor: gsInitBackColor,
                fontSize: gsInitFontSize,
                fontLeft: gsInitFontLeft,
                fontBottom: gsInitFontBottom,
                fontSecondLeft: gsInitFontSecondLeft,
                fontSecondBottom: gsInitFontSecondBottom,
                playerOffset: gsInitPlayerOffset,
                backTransparent: gbInitBackTransparent,
                downloadLink: gbInitDownloadLink,
                screenWidth: giScreenWidth
            });
            
            return true;
        }
    }
    else if (details.msg == "SetIcon") {
        gbOnRightPage = true;
        setIcon();
    }
}


function setIcon()
{
    if (!gTab)
    {
        //alert("NOT EXIST TAB");
        return;
    }
    
    var sPath = gbOnRightPage ? "icon19.png" : "icon19grey.png";

    chrome.browserAction.setIcon({
        tabId: gTab,
        path: sPath
    });
}
