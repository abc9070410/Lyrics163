"use strict";

var giScreenWidth = 0;

window.onload = initPopup;

function initPopup()
{
    getSetting();
    
    document.getElementById("inputSetButton").addEventListener('click', clickSetButton);
    document.getElementById("inputResetButton").addEventListener('click', clickResetButton);
}

function clickSetButton()
{
    setSetting();
}

function clickResetButton()
{
    initSetting();
}

// ex. 0 -> 509
function widthOffsetRatioToPx(iRatio)
{
    return parseInt(giScreenWidth) / 2 - (parseInt(iRatio) * 7 + 100);
}

// ex. 509 -> 0
function widthOffsetPxToRatio(iPx)
{
    return parseInt((giScreenWidth / 2 - parseInt(iPx) - 100) / 7);
}

function setSetting()
{
    var sFontColor = document.getElementById("inputFontColor").value;
    var sBackColor = document.getElementById("inputBackColor").value;
    var sFontSize = document.getElementById("inputFontSize").value;
    var sFontLeft = document.getElementById("inputFontLeft").value;
    var sFontBottom = document.getElementById("inputFontBottom").value;
    var sPlayerOffsetRatio = document.getElementById("inputPlayerOffset").value;
    
    var sPlayerOffsetPx = widthOffsetRatioToPx(sPlayerOffsetRatio);
    
    chrome.extension.sendMessage({
        msg: "SetSetting",
        fontColor: sFontColor,
        backColor: sBackColor,
        fontSize: sFontSize,
        fontLeft: sFontLeft,
        fontBottom: sFontBottom,
        playerOffset: sPlayerOffsetPx
    }, function(response) {
      
    });
}

function getSetting()
{
    chrome.extension.sendMessage({
        msg: "GetSetting",
    }, function(response) {
        giScreenWidth = response.screenWidth;

        document.getElementById("inputFontColor").value = response.fontColor;
        document.getElementById("inputBackColor").value = response.backColor;
        document.getElementById("inputFontSize").value = response.fontSize;
        document.getElementById("inputFontLeft").value = response.fontLeft;
        document.getElementById("inputFontBottom").value = response.fontBottom;
        document.getElementById("inputPlayerOffset").value = widthOffsetPxToRatio(response.playerOffset);
        
       
    });
}

function initSetting()
{
    chrome.extension.sendMessage({
        msg: "GetInitSetting",
    }, function(response) {
        giScreenWidth = response.screenWidth;
    
        document.getElementById("inputFontColor").value = response.fontColor;
        document.getElementById("inputBackColor").value = response.backColor;
        document.getElementById("inputFontSize").value = response.fontSize;
        document.getElementById("inputFontLeft").value = response.fontLeft;
        document.getElementById("inputFontBottom").value = response.fontBottom;
        document.getElementById("inputPlayerOffset").value = widthOffsetPxToRatio(response.playerOffset);
        
        //var i = response.playerOffset;
        //alert(i + "," + widthOffsetPxToRatio(i));
        
        setSetting();
    });
}

