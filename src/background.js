"use strict";

var gsInitFontColor = "#008000";
var gsInitBackColor = "#000000";
var gsInitFontSize = "34";
var gsInitFontLeft = "0";
var gsInitFontBottom = "0";
var gsInitPlayerOffset = "300";
var gbInitBackTransparent = false;

var gsFontColor = gsInitFontColor;
var gsBackColor = gsInitBackColor;
var gsFontSize = gsInitFontSize;
var gsFontLeft = gsInitFontLeft;
var gsFontBottom = gsInitFontBottom;
var gsPlayerOffset = gsInitPlayerOffset;
var gbBackTransparent = gbInitBackTransparent;


var giScreenWidth = 0;
var gbOnRightPage = true;
var gTab = null;

initBackground();

function isOnRightPage(url)
{
    return url.indexOf("music.163.com") > 0;
}

function initBackground()
{
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var tab = chrome.tabs.get(arrayOfTabs[0].id, function(tab) {
            gbOnRightPage = isOnRightPage(tab.url);
            //gTab = arrayOfTabs[0].id;
            //setIcon();
        });
    });

    chrome.extension.onMessage.addListener(onMyMessage);
    chrome.tabs.onActivated.addListener(function(info) {
        var tab = chrome.tabs.get(info.tabId, function(tab) {
            
            gbOnRightPage = isOnRightPage(tab.url);
            gTab = info.tabId;
            setIcon();
            
            if (gbOnRightPage)
            {
                //giScreenWidth = 0; // init when tab is changed
            }
        });
        
        //alert("ID");
    });

    chrome.storage.local.get('urlData', function(items) {
        if (items.urlData) // stored the data before
        {
            //sFontColor, sBackColor, sFontSize, sFontLeft, sFontBottom 
            
            var asData = items.urlData;
            gsFontColor = asData[0];
            gsBackColor = asData[1];
            gsFontSize = asData[2];
            gsFontLeft = asData[3];
            gsFontBottom = asData[4];
            gsPlayerOffset = asData[5];
            gbBackTransparent = asData[6];
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
        gsPlayerOffset = details.playerOffset;
        gbBackTransparent = details.backTransparent;
        
        var asData = new Array(gsFontColor, gsBackColor, gsFontSize, gsFontLeft, gsFontBottom, gsPlayerOffset, gbBackTransparent);
        chrome.storage.local.set({'urlData':asData});

        //alert("FB:" + gsFontBottom);
        
        if (callback) {
            return true;
        }
    }
    else if (details.msg == "GetSetting") {
        
        if (details.screenWidth)
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
                playerOffset: gsPlayerOffset,
                backTransparent: gbBackTransparent,
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
                playerOffset: gsInitPlayerOffset,
                backTransparent: gbInitBackTransparent,
                screenWidth: giScreenWidth
            });
            
            return true;
        }
    }
    else if (details.msg == "SetIcon") {
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

    chrome.browserAction.setIcon({
        tabId: gTab,
        path: "icon19.png"
    });
}
