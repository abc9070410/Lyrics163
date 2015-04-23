
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


function setSetting()
{
    var sFontColor = document.getElementById("inputFontColor").value;
    var sBackColor = document.getElementById("inputBackColor").value;
    var sFontSize = document.getElementById("inputFontSize").value;
    var sFontLeft = document.getElementById("inputFontLeft").value;
    var sFontBottom = document.getElementById("inputFontBottom").value;
    var sPlayerOffset = document.getElementById("inputPlayerOffset").value;
    
    chrome.extension.sendMessage({
        msg: "SetSetting",
        fontColor: sFontColor,
        backColor: sBackColor,
        fontSize: sFontSize,
        fontLeft: sFontLeft,
        fontBottom: sFontBottom,
        playerOffset: sPlayerOffset
    }, function(response) {
      
    });
}

function getSetting()
{
    chrome.extension.sendMessage({
        msg: "GetSetting",
    }, function(response) {
        document.getElementById("inputFontColor").value = response.fontColor;
        document.getElementById("inputBackColor").value = response.backColor;
        document.getElementById("inputFontSize").value = response.fontSize;
        document.getElementById("inputFontLeft").value = response.fontLeft;
        document.getElementById("inputFontBottom").value = response.fontBottom;
        document.getElementById("inputPlayerOffset").value = response.playerOffset;
        
    });
}

function initSetting()
{
    chrome.extension.sendMessage({
        msg: "GetInitSetting",
    }, function(response) {
        document.getElementById("inputFontColor").value = response.fontColor;
        document.getElementById("inputBackColor").value = response.backColor;
        document.getElementById("inputFontSize").value = response.fontSize;
        document.getElementById("inputFontLeft").value = response.fontLeft;
        document.getElementById("inputFontBottom").value = response.fontBottom;
        document.getElementById("inputPlayerOffset").value = response.playerOffset;
        
        setSetting();
    });
}

