//// ConnectLineB2BConnector.setMasterData
/// -----------------------------------------------
/// LAST UPDATE -> 2023-09-18 15:28 - galex
/// -----------------------------------------------
lib.include("ConnectLineEshopCommon.common");

// ---------------------------------------------------------------
// DESCRIPTION: Creates or updates the customer.
// ---------------------------------------------------------------
function setCustomer(obj) {
    if (!fieldHasValue(obj.name) && !fieldHasValue(obj.key))
        return responseError("Customer Name is required!", false);

    var respmsg = "";
    var isUpdate = fieldHasValue(obj.key);
    var objTRDR = X.CREATEOBJ("CUSTOMER");
    var tblTRDR = objTRDR.FINDTABLE("TRDR");

    var newid = 0;
    try {
        var response = initializeResponse(false);
        if (obj.key) {
            objTRDR.DBLOCATE(obj.key);
        }
        else {
            objTRDR.DBINSERT;
        }
        tblTRDR.EDIT;

        if (isUpdate == false) {
            if (fieldHasValue(obj.code))
                tblTRDR.CODE = obj.code;
            // else if (fieldHasValue(obj.name))
            //     tblTRDR.CODE = obj.name;
            else
                tblTRDR.CODE = '*';
        }

        if (fieldHasValue(obj.name) && !fieldHasValue(obj.key))
            tblTRDR.NAME = obj.name;


        if (obj.afm) tblTRDR.AFM = obj.afm;
        if (obj.irsdata) tblTRDR.IRSDATA = obj.irsdata;
        if (obj.email) tblTRDR.EMAIL = obj.email;
        if (obj.email) tblTRDR.EMAILACC = obj.email;
        if (obj.phone1) tblTRDR.PHONE01 = obj.phone1;
        if (obj.phone2) tblTRDR.PHONE02 = obj.phone2;
        if (obj.fax) tblTRDR.FAX = obj.fax;
        if (obj.address) tblTRDR.ADDRESS = obj.address;
        if (obj.zip) tblTRDR.ZIP = obj.zip;
        if (obj.district) tblTRDR.DISTRICT = obj.district;
        if (obj.city) tblTRDR.CITY = obj.city;
        if (obj.country) tblTRDR.COUNTRY = obj.country;
        // if (obj.country) {
        //     var countryCode = getCountryCodeFromIntercode(obj.country);
        //     if (getCountryCodeFromIntercode(obj.country).success == 0)
        //         return false;
        //     tblTRDR.COUNTRY = countryCode.data[0].COUNTRY;
        // }
        if (obj.remarks) tblTRDR.REMARKS = obj.remarks;
        if (obj.jobtypetrd) tblTRDR.JOBTYPETRD = obj.jobtype;
        if (obj.trdcategory) tblTRDR.TRDCATEGORY = obj.trdcategory;
        tblTRDR.S1INVMD = 4;

        newid = objTRDR.DBPOST;
        if (obj.key)
            response.id = obj.key;
        else
            response.id = newid;
    }
    catch (e) {
        return responseError("Error in posting data. Error Message: " + e.message, false);
    }
    finally {
        obj.FREE;
        obj = null;
    }

    return response;
}

