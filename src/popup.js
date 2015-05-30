"use strict";

var giScreenWidth = 0;
var giScreenHeight = 0;
var gbEnable = true;

window.onload = initPopup;

function initPopup()
{
    getSetting();

    //initSetting();
    
    document.getElementById("divEnableButton").addEventListener('click', clickEnableButton);
    document.getElementById("inputConfirmButton").addEventListener('click', clickSetButton);
    document.getElementById("inputResetButton").addEventListener('click', clickResetButton);
    document.getElementById("inputBackTransparent").addEventListener('change', changeBackTransparent);
    document.getElementById("inputDownloadLink").addEventListener('change', changeDownloadLink);
}

function setLanguage()
{
    document.getElementById("divAppNote").innerHTML = chrome.i18n.getMessage("_appName");

    document.getElementById("divDownloadLink").innerHTML = chrome.i18n.getMessage("_downloadLink");
    document.getElementById("divFontColor").innerHTML = chrome.i18n.getMessage("_fontColor");
    document.getElementById("divBackColor").innerHTML = chrome.i18n.getMessage("_backColor");
    document.getElementById("divBackTransparent").innerHTML = chrome.i18n.getMessage("_backTransparent");
    document.getElementById("divFontShadow").innerHTML = chrome.i18n.getMessage("_fontShadow");
    document.getElementById("divFontSize").innerHTML = chrome.i18n.getMessage("_fontSize") + "(" + document.getElementById("inputFontSize").min + " ~ " + document.getElementById("inputFontSize").max + ")";
    document.getElementById("divFontLeft").innerHTML = chrome.i18n.getMessage("_fontLeft") + "(" + document.getElementById("inputFontLeft").min + " ~ " + document.getElementById("inputFontLeft").max + ")";
    document.getElementById("divFontBottom").innerHTML = chrome.i18n.getMessage("_fontBottom") + "(" + document.getElementById("inputFontBottom").min + " ~ " + document.getElementById("inputFontBottom").max + ")";
    document.getElementById("divFontSecondLeft").innerHTML = chrome.i18n.getMessage("_fontSecondLeft") + "(" + document.getElementById("inputFontSecondLeft").min + " ~ " + document.getElementById("inputFontSecondLeft").max + ")";
    document.getElementById("divFontSecondBottom").innerHTML = chrome.i18n.getMessage("_fontSecondBottom") + "(" + document.getElementById("inputFontSecondBottom").min + " ~ " + document.getElementById("inputFontSecondBottom").max + ")";
    document.getElementById("divPlayerOffset").innerHTML = chrome.i18n.getMessage("_playerOffset") + "(" + document.getElementById("inputPlayerOffset").min + " ~ " + document.getElementById("inputPlayerOffset").max + ")";
    document.getElementById("divTransparentRatio").innerHTML = chrome.i18n.getMessage("_backTransparentRatio") + "(" + document.getElementById("inputTransparentRatio").min + " ~ " + document.getElementById("inputTransparentRatio").max + ")";
    document.getElementById("inputResetButton").value = chrome.i18n.getMessage("_resetButton");
    document.getElementById("inputConfirmButton").value = chrome.i18n.getMessage("_confirmButton");
    
    updateEnableButton();
}

function updateEnableButton()
{
    var sEnableText = chrome.i18n.getMessage("_enableButton");
    var sDisableText = chrome.i18n.getMessage("_disableButton");

    document.getElementById("aEnableButton").innerHTML = gbEnable ? sDisableText : sEnableText;
    
    var sDisplay = gbEnable ? "" : "none";

    document.getElementById("formMainTable").style.display = sDisplay;
}

function clickEnableButton()
{
    gbEnable = !gbEnable;
    
    setSetting();
    updateEnableButton();
    
    reloadPage(); // enable the new setting
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

function setBackColorHTML()
{
    var sDisplay = document.getElementById("inputBackTransparent").checked ? "none" : "";

    document.getElementById("trBackColor").style.display = sDisplay;
    document.getElementById("trTransparentRatio").style.display = sDisplay;
}

function setButtonHTML(bVisible)
{
    var sDisplay = bVisible ? "" : "none";

    document.getElementById("inputResetButton").style.display = sDisplay;
    document.getElementById("inputConfirmButton").style.display = sDisplay;
    document.getElementById("divEnableButton").style.display = sDisplay;
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
    var sPlayerOffsetPx = document.getElementById("inputPlayerOffset").value;
    var bFontShadow = document.getElementById("inputFontShadow").checked;
    var sTransparentRatio = document.getElementById("inputTransparentRatio").value;
    var bEnable = gbEnable;
    
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
        downloadLink: bDownloadLink,
        fontShadow: bFontShadow,
        transparentRatio: sTransparentRatio,
        enable: bEnable
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
        giScreenHeight = response.screenHeight;
        gbEnable = response.enable;
        
        setButtonHTML(true);
        
        if (gbEnable && response.onRightPage && giScreenWidth <= 0) 
        {
            //console.log("NEED RELOAD PAGE");
            reloadPage(); // need reload page for getting the right screen width
        }
        
        resetSizeSetting();

        setLanguage();
        
        setByResponse(response);
        
        setBackColorHTML();
    });
}

function resetSizeSetting()
{
    document.getElementById("inputFontLeft").max = giScreenWidth;
    document.getElementById("inputFontBottom").max = giScreenHeight;
    document.getElementById("inputFontSecondLeft").max = giScreenWidth;
    document.getElementById("inputFontSecondBottom").max = giScreenHeight;
    document.getElementById("inputPlayerOffset").max = giScreenWidth;
}

function reloadPage()
{
    // reload the current tab window
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var code = "window.location.reload();";
        chrome.tabs.executeScript(arrayOfTabs[0].id, {code: code});

        window.close(); // close the pop window
    });
}

function initSetting()
{
    chrome.extension.sendMessage({
        msg: "GetInitSetting"
    }, function(response) {
        giScreenWidth = response.screenWidth;
        giScreenHeight = response.screenHeight;
        gbEnable = response.enable;
    
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
    document.getElementById("inputPlayerOffset").value = response.playerOffset;
    document.getElementById("inputBackTransparent").checked = response.backTransparent;
    document.getElementById("inputDownloadLink").checked = response.downloadLink;
    document.getElementById("inputFontShadow").checked = response.fontShadow;
    document.getElementById("inputTransparentRatio").value = response.transparentRatio;
    
    //var sEnableText = response.enable ? chrome.i18n.getMessage("_disableButton") : chrome.i18n.getMessage("_enableButton");
    
    //document.getElementById("aEnableButton").innerHTML = sEnableText;
}