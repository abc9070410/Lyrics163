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
        });
    });

    chrome.extension.onMessage.addListener(onMyMessage);
    chrome.tabs.onActivated.addListener(function(info) {
        var tab = chrome.tabs.get(info.tabId, function(tab) {
            gbOnRightPage = isOnRightPage(tab.url);
        });
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
        //alert( "#RC:setTitleAndPicUrl:" + gasTitle + "___" + gasPicUrl );
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
        //alert( "#RC:setTitleAndPicUrl:" + gasTitle + "___" + gasPicUrl );
        
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
        //alert( "#RC:setTitleAndPicUrl:" + gasTitle + "___" + gasPicUrl );
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
}


