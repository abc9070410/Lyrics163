"use strict";

var giScreenWidth = 0;

window.onload = initPopup;

function initPopup()
{
    setLanguage();
    getSetting();
    
    document.getElementById("inputConfirmButton").addEventListener('click', clickSetButton);
    document.getElementById("inputResetButton").addEventListener('click', clickResetButton);
    document.getElementById("inputBackTransparent").addEventListener('change', changeBackTransparent);
}

function setLanguage()
{
    document.getElementById("divAppNote").innerHTML = chrome.i18n.getMessage("_appNote");

    document.getElementById("divFontColor").innerHTML = chrome.i18n.getMessage("_fontColor");
    document.getElementById("divBackColor").innerHTML = chrome.i18n.getMessage("_backColor");
    document.getElementById("divBackTransparent").innerHTML = chrome.i18n.getMessage("_backTransparent");
    document.getElementById("divFontSize").innerHTML = chrome.i18n.getMessage("_fontSize");
    document.getElementById("divFontLeft").innerHTML = chrome.i18n.getMessage("_fontLeft");
    document.getElementById("divFontBottom").innerHTML = chrome.i18n.getMessage("_fontBottom");
    document.getElementById("divPlayerOffset").innerHTML = chrome.i18n.getMessage("_playerOffset");
    document.getElementById("inputResetButton").value = chrome.i18n.getMessage("_resetButton");
    document.getElementById("inputConfirmButton").value = chrome.i18n.getMessage("_confirmButton");
}

function clickSetButton()
{
    setSetting();
}

function changeBackTransparent()
{
    setBackColorHTML();
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

function isBackTransparent()
{
    return document.getElementById("inputBackTransparent").checked;
}

function setBackColorHTML()
{
    var sVisible = isBackTransparent() ? "hidden" : "visible";

    document.getElementById("trBackColor").style.visibility = sVisible;
}

function setButtonHTML(bVisible)
{
    var sVisible = bVisible ? "visible" : "hidden";

    document.getElementById("inputResetButton").style.visibility = sVisible;
    document.getElementById("inputConfirmButton").style.visibility = sVisible;
}

function setSetting()
{
    var bBackTransparent = document.getElementById("inputBackTransparent").checked;
    var sFontColor = document.getElementById("inputFontColor").value;
    var sBackColor = bBackTransparent ?  "" : document.getElementById("inputBackColor").value;
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
        playerOffset: sPlayerOffsetPx,
        backTransparent: bBackTransparent
    }, function(response) {
      
    });
}

function getSetting()
{
    chrome.extension.sendMessage({
        msg: "GetSetting",
    }, function(response) {
        giScreenWidth = response.screenWidth;
        
        setButtonHTML(response.onRightPage);
        
        if (response.onRightPage && giScreenWidth <= 0) // need get the right screen width
        {
            //alert("X");
            reloadPage();
        }
        
        //reloadPage();
        
        document.getElementById("inputFontColor").value = response.fontColor;
        document.getElementById("inputBackColor").value = response.backColor;
        document.getElementById("inputFontSize").value = response.fontSize;
        document.getElementById("inputFontLeft").value = response.fontLeft;
        document.getElementById("inputFontBottom").value = response.fontBottom;
        document.getElementById("inputPlayerOffset").value = widthOffsetPxToRatio(response.playerOffset);
        document.getElementById("inputBackTransparent").checked = response.backTransparent;
        
        setBackColorHTML();
    });
}

function reloadPage()
{
    // close the pop window
    window.close(); 

    // reload the current tab window
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var code = "window.location.reload();";
        chrome.tabs.executeScript(arrayOfTabs[0].id, {code: code});
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
        
        setSetting();
    });
}

