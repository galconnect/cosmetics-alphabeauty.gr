//// ConnectLineEshopCommon.common
/// -----------------------------------------------
/// LAST UPDATE -> 2023-05-25 15:38 - galex
/// -----------------------------------------------
function initializeResponse(hasDataList) {
    var response = {};
    response.success = true;
    response.error = "";
    if (hasDataList == true) {
        response.totalcount = 0;
        response.data = [];
    }
    else
        response.id = null;

    return response;
}

function checkRequest(obj) {
    try {
        return (obj.clientid && obj.clientid != "" && obj.appid && obj.appid != "");
    }
    catch (e) {
        return false;
    }
}

function checkRequestCommon(obj, appid) {
    try {
        return (obj.clientid && obj.clientid != "" && obj.appid && obj.appid != "" && obj.appid == appid);
    }
    catch (e) {
        return false;
    }
}

function responseError(message) {
    return responseError(message, null);
}

function responseError(message, hasDataList) {
    var resp = {};
    if (hasDataList != null)
        resp = initializeResponse(hasDataList);
    resp.success = false;
    if (message)
        resp.error = message;
    else
        resp.error = "Authenticate failed due to invalid credentials!";

    return resp;
}

function fieldHasValue(fieldValue) {
    return (fieldValue != null && fieldValue != undefined && fieldValue != "" && fieldValue != "false");
}

function convertKeysToLowerCase(obj) {
    var vjsonString = JSON.stringify(obj);
    vjsonString = vjsonString.replace(/"([^"]+)":/g, function ($0, $1) { return ('"' + $1.toLowerCase() + '":'); });

    return JSON.parse(vjsonString);
}

function formatDateTime(dt) {
    return "'" + dt.replace(new RegExp(":", 'g'), "' + CHAR(58) + '") + "'";
}

function getPaymentCodeFromCustomArray(shipment_text_code) {
    if (shipment_text_code.toLowerCase() == 'stripe')
        return 1006;
    else if (shipment_text_code.toLowerCase() == 'paypal')
        return 1007;
}

function seriralizePrices(value) {
    returnValue = JSON.stringify(value).replace(".", ",");
    // returnValue = JSON.stringify(value);
    return returnValue.replace(/"/g, "");
}
