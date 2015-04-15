var gsInitFontColor = "green";
var gsInitBackColor = "black";
var gsInitFontSize = "30";
var gsInitFontLeft = "27";
var gsInitFontBottom = "1";

function resetSetting()
{
    document.getElementById("inputFontColor").value = gsInitFontColor;
    document.getElementById("inputBackColor").value = gsInitBackColor;
    document.getElementById("inputFontSize").value = gsInitFontSize;
    document.getElementById("inputFontLeft").value = gsInitFontLeft;
    document.getElementById("inputFontBottom").value = gsInitFontBottom;
}

function changeSetting()
{
    var sFontColor = document.getElementById("inputFontColor").value;
    var sBackColor = document.getElementById("inputBackColor").value;
    var sFontSize = document.getElementById("inputFontSize").value;
    var sFontLeft = document.getElementById("inputFontLeft").value;
    var sFontBottom = document.getElementById("inputFontBottom").value;
    
    var asData = new Array( sFontColor, sBackColor, sFontSize, sFontLeft, sFontBottom );
    
    chrome.storage.local.set({'urlData':asData});

    //alert( "Store: " + asData);
}
