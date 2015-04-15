
window.onload = initPopup;

function initPopup()
{
    resetSetting();

    chrome.storage.local.get('urlData', function(items) {
        var asData = items.urlData;
        
        document.getElementById("inputFontColor").value = asData[0];
        document.getElementById("inputBackColor").value = asData[1];
        document.getElementById("inputFontSize").value = asData[2];
        document.getElementById("inputFontLeft").value = asData[3];
        document.getElementById("inputFontBottom").value = asData[4];

    });
    
    document.getElementById("inputSetButton").addEventListener('click', clickSetButton);
    document.getElementById("inputResetButton").addEventListener('click', clickResetButton);
}

function clickSetButton()
{
    changeSetting();
}

function clickResetButton()
{
    resetSetting();
    changeSetting();
}
