"use strict";

var gsInitFontColor = "#008000";
var gsInitBackColor = "#000000";
var gsInitFontSize = "34";
var gsInitFontLeft = "0";
var gsInitFontBottom = "0";
var gsInitFontSecondLeft = "" + (parseInt(gsInitFontSize) + 5);
var gsInitFontSecondBottom = "" + (parseInt(gsInitFontSize) + 7);
var gsInitPlayerOffset = "300";
var gbInitBackTransparent = false;
var gbInitDownloadLink = false;
var gbInitFontShadow = false;
var gsInitTransparentRatio = "0.4";
var gbInitEnable = true;

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
var gbFontShadow = gbInitFontShadow;
var gsTransparentRatio = gsInitTransparentRatio;
var gbEnable = gbInitEnable;

var giScreenWidth = 0;
var giScreenHeight = 0;
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
            
            setIcon();
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
        });
    });

    chrome.storage.local.get('urlData', function(items) {
        var asData = items.urlData;
        var iDataAmount = 13;
        
        // stored the data before
        if (asData && asData.length == iDataAmount)
        {
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
            gbFontShadow = asData[10];
            gsTransparentRatio = asData[11];
            gbEnable = asData[12];
        }
        else 
        {
            // have not store the data yet
            alert("not match:" + asData.length + " != " + iDataAmount);
        }
    });
    
    
}

function sendChangeRequest()
{
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        //alert("ID:" + arrayOfTabs[0].id);
        chrome.tabs.sendMessage(arrayOfTabs[0].id, {greeting: "ChangeSetting"}, 
      
        function(response) {
            console.log(response.farewell);
        });
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
        gbFontShadow = details.fontShadow;
        gsTransparentRatio = details.transparentRatio;
        gbEnable = details.enable;
        
        var asData = [gsFontColor, gsBackColor, gsFontSize, gsFontLeft, gsFontBottom, gsFontSecondLeft, gsFontSecondBottom, gsPlayerOffset, gbBackTransparent, gbDownloadLink, gbFontShadow, gsTransparentRatio, gbEnable];
        chrome.storage.local.set({'urlData':asData});
        
        //alert("FB:" + gsFontBottom);
        
        sendChangeRequest();
        
        if (callback) {
            return true;
        }
    }
    else if (details.msg == "GetSetting") {
    
        // request from the content script (myLyrics.js)
        if (details.screenWidth) 
        {
            giScreenWidth = details.screenWidth;
            giScreenHeight = details.screenHeight;
            gsInitPlayerOffset = "" + (giScreenWidth - 100);
            gsPlayerOffset = gsInitPlayerOffset;
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
                fontShadow: gbFontShadow,
                transparentRatio: gsTransparentRatio,
                enable: gbEnable,
                
                
                screenWidth: giScreenWidth,
                screenHeight: giScreenHeight,
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
                fontShadow: gbInitFontShadow,
                transparentRatio: gsInitTransparentRatio,
                enable: gbEnable,
                
                
                screenWidth: giScreenWidth,
                screenHeight: giScreenHeight
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
    var sPath = gbOnRightPage ? "icon19.png" : "icon19grey.png";
    
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        chrome.browserAction.setIcon({
            tabId: arrayOfTabs[0].id,
            path: sPath
        });
    });

    
}
