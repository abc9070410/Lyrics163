var gsInitFontColor = "green";
var gsInitBackColor = "black";
var gsInitFontSize = "30";
var gsInitFontLeft = "0";
var gsInitFontBottom = "1";
var gsInitPlayerOffset = "40";

var gsFontColor = gsInitFontColor;
var gsBackColor = gsInitBackColor;
var gsFontSize = gsInitFontSize;
var gsFontLeft = gsInitFontLeft;
var gsFontBottom = gsInitFontBottom;
var gsPlayerOffset = gsInitPlayerOffset;

initBackground();

function initBackground()
{
    chrome.extension.onMessage.addListener(onMyMessage);

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
        
        var asData = new Array(gsFontColor, gsBackColor, gsFontSize, gsFontLeft, gsFontBottom, gsPlayerOffset);
        chrome.storage.local.set({'urlData':asData});

        //alert("FB:" + gsFontBottom);
        
        if (callback) {
            return true;
        }
    }
    else if (details.msg == "GetSetting") {
        //alert( "#RC:setTitleAndPicUrl:" + gasTitle + "___" + gasPicUrl );
        if (callback) {
            callback({
                fontColor: gsFontColor,
                backColor: gsBackColor,
                fontSize: gsFontSize,
                fontLeft: gsFontLeft,
                fontBottom: gsFontBottom,
                playerOffset: gsPlayerOffset
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
                playerOffset: gsInitPlayerOffset
            });
            
            return true;
        }
    }
}



