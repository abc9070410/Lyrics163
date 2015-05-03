"use strict";

var giScreenWidth = 0;

window.onload = initPopup;

function initPopup()
{
    setLanguage();
    
    getSetting();

    //initSetting();
    
    document.getElementById("inputConfirmButton").addEventListener('click', clickSetButton);
    document.getElementById("inputResetButton").addEventListener('click', clickResetButton);
    document.getElementById("inputBackTransparent").addEventListener('change', changeBackTransparent);
    document.getElementById("inputDownloadLink").addEventListener('change', changeDownloadLink);
}

function setLanguage()
{
    //document.getElementById("divAppNote").innerHTML = chrome.i18n.getMessage("_appNote");

    document.getElementById("divDownloadLink").innerHTML = chrome.i18n.getMessage("_downloadLink");
    document.getElementById("divFontColor").innerHTML = chrome.i18n.getMessage("_fontColor");
    document.getElementById("divBackColor").innerHTML = chrome.i18n.getMessage("_backColor");
    document.getElementById("divBackTransparent").innerHTML = chrome.i18n.getMessage("_backTransparent");
    document.getElementById("divFontSize").innerHTML = chrome.i18n.getMessage("_fontSize");
    document.getElementById("divFontLeft").innerHTML = chrome.i18n.getMessage("_fontLeft");
    document.getElementById("divFontBottom").innerHTML = chrome.i18n.getMessage("_fontBottom");
    document.getElementById("divFontSecondLeft").innerHTML = chrome.i18n.getMessage("_fontSecondLeft");
    document.getElementById("divFontSecondBottom").innerHTML = chrome.i18n.getMessage("_fontSecondBottom");
    document.getElementById("divPlayerOffset").innerHTML = chrome.i18n.getMessage("_playerOffset");
    document.getElementById("inputResetButton").value = chrome.i18n.getMessage("_resetButton");
    document.getElementById("inputConfirmButton").value = chrome.i18n.getMessage("_confirmButton");
}

function clickSetButton()
{
    setSetting();
}

function changeDownloadLink()
{
    var isChecked = document.getElementById("inputDownloadLink").checked;
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

function setBackColorHTML()
{
    var sDisplay = document.getElementById("inputBackTransparent").checked ? "none" : "";

    document.getElementById("trBackColor").style.display = sDisplay;
}

function setButtonHTML(bVisible)
{
    var sDisplay = bVisible ? "" : "none";

    document.getElementById("inputResetButton").style.display = sDisplay;
    document.getElementById("inputConfirmButton").style.display = sDisplay;
}


function setSetting()
{
    var bBackTransparent = document.getElementById("inputBackTransparent").checked;
    var bDownloadLink = document.getElementById("inputDownloadLink").checked;
    var sFontColor = document.getElementById("inputFontColor").value;
    var sBackColor = bBackTransparent ?  "" : document.getElementById("inputBackColor").value;
    var sFontSize = document.getElementById("inputFontSize").value;
    var sFontLeft = document.getElementById("inputFontLeft").value;
    var sFontBottom = document.getElementById("inputFontBottom").value;
    var sFontSecondLeft = document.getElementById("inputFontSecondLeft").value;
    var sFontSecondBottom = document.getElementById("inputFontSecondBottom").value;
    var sPlayerOffsetRatio = document.getElementById("inputPlayerOffset").value;
    
    var sPlayerOffsetPx = widthOffsetRatioToPx(sPlayerOffsetRatio);

    chrome.extension.sendMessage({
        msg: "SetSetting",
        fontColor: sFontColor,
        backColor: sBackColor,
        fontSize: sFontSize,
        fontLeft: sFontLeft,
        fontBottom: sFontBottom,
        fontSecondLeft: sFontSecondLeft,
        fontSecondBottom: sFontSecondBottom,
        playerOffset: sPlayerOffsetPx,
        backTransparent: bBackTransparent,
        downloadLink: bDownloadLink
    }, function(response) {
      
    });
}

function getSetting()
{
    chrome.extension.sendMessage({
        msg: "GetSetting",
        screenWidth: 0
    }, function(response) {
        giScreenWidth = response.screenWidth;
        
        setButtonHTML(response.onRightPage);
        
        if (response.onRightPage && giScreenWidth <= 0) 
        {
            // need reload page for getting the right screen width
            reloadPage();
        }
        
        setByResponse(response);
        
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
    
        setByResponse(response);
        
        setSetting();
    });
}

function setByResponse(response)
{
    document.getElementById("inputFontColor").value = response.fontColor;
    document.getElementById("inputBackColor").value = response.backColor;
    document.getElementById("inputFontSize").value = response.fontSize;
    document.getElementById("inputFontLeft").value = response.fontLeft;
    document.getElementById("inputFontBottom").value = response.fontBottom;
    document.getElementById("inputFontSecondLeft").value = response.fontSecondLeft;
    document.getElementById("inputFontSecondBottom").value = response.fontSecondBottom;
    document.getElementById("inputPlayerOffset").value = widthOffsetPxToRatio(response.playerOffset);
    document.getElementById("inputBackTransparent").checked = response.backTransparent;
    document.getElementById("inputDownloadLink").checked = response.downloadLink;
}