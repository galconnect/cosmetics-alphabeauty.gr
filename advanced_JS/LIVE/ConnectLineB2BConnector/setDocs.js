//// ConnectLineB2BConnector.setDocs
/// ----------------------------------------------------
/// LAST UPDATE -> 2023-11-10 16:02 - galex
/// ----------------------------------------------------
lib.include("ConnectLineEshopCommon.common");
lib.include("ConnectLineB2BConnector.setMasterData");
lib.include("ConnectLineB2BConnector.getMasterData");

/*
 * Καταχώρηση Παραγγελίας
 */
function setOrder(obj) {
    debugger;
    if (!fieldHasValue(obj.invoice)) obj.invoice = 0;
    //obj.site = 0;
    //obj.defauleClient = 1;
    if (!fieldHasValue(obj.date))
        return responseError("Date is required!", false);
    //if (obj.trdr == null)
    //	return responseError("Must have trdr for customer ID!", false);

    var customerProcessResult = processCustomer(obj);
    if (customerProcessResult.id == null) {
        return responseError(customerProcessResult.error, false);
    }

    if (obj.invoice && obj.invoice == 1) var objFINDOC = X.CREATEOBJ("SALDOC");
    else var objFINDOC = X.CREATEOBJ("SALDOC");

    var tblFINDOC = objFINDOC.FINDTABLE("FINDOC");
    var tblMTRDOC = objFINDOC.FINDTABLE("MTRDOC");
    var tblITELINES = objFINDOC.FINDTABLE("ITELINES");
    var tblSRVLINES = objFINDOC.FINDTABLE("SRVLINES");
    var tblEXPANAL = objFINDOC.FINDTABLE("EXPANAL");
    var newid = 0;
    try {
        objFINDOC.DBINSERT;
        tblFINDOC.EDIT;
        // tblFINDOC.SERIES = getSeries(obj);
        if (!obj.series) tblFINDOC.SERIES = getSeries(obj);
        else tblFINDOC.SERIES = obj.series;
        tblFINDOC.TRDR = customerProcessResult.id;
        tblFINDOC.TRNDATE = obj.date;
        //tblFINDOC.VARCHAR01 = obj.varchar01;

        if (obj.payment) tblFINDOC.PAYMENT = getPaymentCodeFromShop(obj.payment);
        if (obj.shipment) tblFINDOC.SHIPMENT = getShipmentCodeFromShop(obj.shipment);
        if (obj.remarks) tblFINDOC.REMARKS = obj.remarks;
        // if (obj.comments) tblFINDOC.COMMENTS = obj.comments;
        if (obj.finstates) tblFINDOC.FINSTATES = obj.finstates;
        // if (obj.finstates) tblFINDOC.FINSTATES = obj.finstates; else tblFINDOC.FINSTATES = "1000"; // 1000	ΕΚΚΡΕΜΕΙ

        if (obj.webid) {
            tblFINDOC.CMPFINCODE = obj.webid;
            // tblFINDOC.COMMENTS = obj.webid;
        }

        if (obj.orderfrom) tblFINDOC.UFTBL01 = obj.orderfrom; else tblFINDOC.UFTBL01 = 1; // 1 = Παραγγελία από Ιστοσελίδα

        // if (obj.billinfo.name) tblFINDOC.cccclvarchar02 = obj.billinfo.name;

        var shipInfo = obj.shipinfo;
        tblMTRDOC.EDIT;
        // if (shipInfo.name) tblFINDOC.CCCParaliptisName = shipInfo.name;
        if (shipInfo.address) tblMTRDOC.SHIPPINGADDR = shipInfo.address;
        if (shipInfo.zip) tblMTRDOC.SHPZIP = shipInfo.zip;
        if (shipInfo.district) tblMTRDOC.SHPDISTRICT = shipInfo.district;
        if (shipInfo.city) tblMTRDOC.SHPCITY = shipInfo.city;

        debugger;
        for (i in obj.items) {
            tblITELINES.EDIT;
            tblITELINES.APPEND;
            tblITELINES.SRCHCODE = obj.items[i].code;

            tblITELINES.QTY1 = obj.items[i].qty1;
            tblITELINES.PRICE = seriralizePrices(obj.items[i].price);
            if (fieldHasValue(obj.items[i].total))
                tblITELINES.LINEVAL = seriralizePrices(obj.items[i].total);
            else tblITELINES.LINEVAL = tblITELINES.QTY1 * tblITELINES.PRICE;

            tblITELINES.POST;
        }

        // // Υπηρεσίες ------------
        // for (i in obj.services) {
        //     tblSRVLINES.EDIT;
        //     tblSRVLINES.APPEND;
        //     srchcode = obj.services[i].mtrl;

        //     debugger;
        //     tblSRVLINES.MTRL = srchcode;
        //     tblSRVLINES.QTY1 = obj.services[i].qty1;
        //     tblSRVLINES.PRICE = seriralizePrices(obj.services[i].price);
        //     tblSRVLINES.LINEVAL = seriralizePrices(obj.services[i].total);
        //     tblSRVLINES.POST;
        // }

        //-----ΕΞΟΔΑ------------------------------------------------
        for (i in obj.expanal) {
            tblEXPANAL.EDIT;
            tblEXPANAL.APPEND;
            tblEXPANAL.EXPN = obj.expanal[i].expn;
            tblEXPANAL.EXPVAL = obj.expanal[i].expval;
            tblEXPANAL.POST;
        }
        //----------------------------------------------------------

        newid = objFINDOC.DBPOST;
        var response = initializeResponse(false);
        response.id = newid;
    } catch (e) {
        return responseError(
            "Error in saving order. Error Message: " + e.message,
            false
        );
    } finally {
        obj.FREE;
        obj = null;
    }

    return response;
}

function updateOrder(obj) {
    obj.saldoc = obj.saldoc[0];
    //"KEY":"129023",
    //"FINSTATES":"1004",
    //"INVOICE":0
    if (!fieldHasValue(obj.saldoc.key))
        return responseError("No order id on key field!", false);

    if (!fieldHasValue(obj.saldoc.finstates))
        return responseError("No order status on request!", false);

    if (obj.invoice && obj.invoice == 1)
        var objFINDOC = X.CREATEOBJ("SALDOC;Προβολή για site");
    else var objFINDOC = X.CREATEOBJ("SALDOC;Προβολή για site");

    var tblFINDOC = objFINDOC.FINDTABLE("FINDOC");

    var newid = 0;
    try {
        //objFINDOC.DBINSERT;
        objFINDOC.DBLocate(obj.saldoc.key);
        tblFINDOC.EDIT;

        tblFINDOC.FINSTATES = obj.saldoc.finstates;

        objFINDOC.DBPOST;
        var response = initializeResponse(false);
        response.id = obj.saldoc.key;
    } catch (e) {
        return responseError(
            "Error in saving order. Error Message: " + e.message,
            false
        );
    } finally {
        obj.FREE;
        obj = null;
    }

    return response;
}

function getShipInfo(obj) {
    var info = obj.billinfo;
    if (obj.shipinfo != null) info = obj.shipinfo;

    var shipInfoInternal = {};
    shipInfoInternal.company = info.company;
    shipInfoInternal.name = info.name;
    shipInfoInternal.address = info.address;
    shipInfoInternal.city = info.city;
    shipInfoInternal.zip = info.zip;
    shipInfoInternal.district = info.district;
    shipInfoInternal.email = info.email;
    shipInfoInternal.phone1 = info.phone1;

    return shipInfoInternal;
}

function getSeries(obj) {
    if (customerNeedsInvoice(obj) == true) return 7025;
    return 7026;
}

function customerNeedsInvoice(obj) {
    return fieldHasValue(obj.invoice) && obj.invoice == true;
}

function getTrdCategory(obj) {
    if (customerNeedsInvoice(obj) == true) return 3000;
    return 3099;
}

function getPaymentCodeFromShop(payment) {
    if (payment == 1) return 1001; // Αντικαταβολή
    if (payment == 2) return 1000; // Πληρωμή στο Κατάστημα
    if (payment == 3) return 1012; // PayPal
    if (payment == 4) return 1005; // Πληρωμή με Πιστωτική - Χρεωστική κάρτα
    if (payment == 5) return 1011; // Τραπεζική Κατάθεση
}

function getShipmentCodeFromShop(shipment) {
    if (shipment == 1) return 1; // Αποστολή με Courier 	
    if (shipment == 2) return 2; // Παραλαβή από το Κάταστημα
}

function processCustomer(obj) {
    var criteria = {};
    var responseCustomerProcess = { id: null, error: "" };
    debugger
    if (fieldHasValue(obj.billinfo.trdcategory)) { criteria.trdcategory = obj.billinfo.trdcategory; } else { criteria.trdcategory = getTrdCategory(obj); }
    if (customerNeedsInvoice(obj) == true) {
        if (fieldHasValue(obj.billinfo.afm)) criteria.afm = obj.billinfo.afm; else {
            responseCustomerProcess.error =
                "Failed to check for customers. Invoice requirement AFM!"
            return responseCustomerProcess;
        }
    } else {
        criteria.phone = obj.billinfo.phone1;
        criteria.email = obj.billinfo.email;
        criteria.code = obj.billinfo.code;
    }

    if (fieldHasValue(obj.billinfo.id)) {
        responseCustomerProcess.id = obj.billinfo.id;
    } else {
        var customerData = getCustomers(criteria);
        if (customerData.success == true) {
            // The customer already exists
            if (customerData.totalcount == 1) {
                // ToDo: Decide if we have to update the customer or not.
                responseCustomerProcess.id = customerData.data[0].customer_id;
            } else if (customerData.totalcount == 0) {
                obj.billinfo.trdcategory = criteria.trdcategory;
                customerData = setCustomer(obj.billinfo);
                if (customerData.success == true) {
                    // The customer inserted succesfully.
                    responseCustomerProcess.id = customerData.id;
                } else {
                    // The customer is not inserted at SoftOne. Return error
                    responseCustomerProcess.error =
                        "Failed to insert customer at SoftOne!";
                }
            } else {
                // customerData.totalcount > 1
                responseCustomerProcess.error =
                    "More than 1 customer found at SoftOne!";
            }
        } else {
            // Failed to check for customers.
            responseCustomerProcess.error =
                "Failed to check for customers at SoftOne!";
        }
    }

    return responseCustomerProcess;
}

function calculateOrder(obj) {
    debugger;
    var response = {};
    var characteristicsObj = {};
    response.success = "";
    response.sum = "";
    response.items = [];
    response.expenses = [];
    var resItelines = {};
    var resExpenses = {};

    //if (!fieldHasValue(obj.date))
    //	return responseError("Date is required!", false);
    //if (!fieldHasValue(obj.customer_id))
    //	return responseError("Customer is required!", false);
    //if (obj.billinfo == null)
    //	return responseError("Billing information is required!", false);
    //
    //if (!fieldHasValue(obj.billinfo.trdcategory))
    //{
    //	obj.billinfo.trdcategory = getTrdCategory(obj);
    //}
    //
    //var customerProcessResult = processCustomer(obj);
    //if (customerProcessResult.id == null)
    //{
    //	return responseError(customerProcessResult.error, false);
    //}

    var ws = {};
    ws.SERVICE = "Calculate";
    ws.OBJECT = "SALDOC";
    ws.LOCATEINFO = obj.locatinfo;
    ws.FORM = "Προβολή για site";
    ws.DATA = {};
    ws.DATA.SALDOC = [];
    //ws.DATA.MTRDOC = [];
    ws.DATA.ITELINES = [];
    //ws.DATA.EXPANAL = [];
    try {
        var saldocObj = {};

        if (obj.saldoc[0].series)
            saldocObj.SERIES = obj.saldoc[0].series;
        else
            saldocObj.SERIES = getSeries(obj);

        if (obj.customerdata[0].afm == null || obj.customerdata[0].afm == "")
            obj.customerdata[0].afm = "008841250";
        //return responseError("Customer Afm is required!", false);

        customerData = getCustomers(obj.customerdata[0]);

        if (customerData.success == true) {
            // The customer already exists
            if (customerData.totalcount == 1) {
                // ToDo: Decide if we have to update the customer or not.
                saldocObj.TRDR = customerData.data[0].customer_id;
            } else {
                saldocObj.TRDR = 16339;
                //return responseError("Customer is required!", false);
            }
        } else saldocObj.TRDR = 16339;

        //saldocObj.TRNDATE = obj.date;

        //if (obj.payment) saldocObj.PAYMENT = obj.payment;
        //if (obj.shipment) saldocObj.SHIPMENT = obj.shipment;
        //if (obj.remarks)	saldocObj.REMARKS = obj.remarks;
        //if (obj.comments)	saldocObj.COMMENTS = obj.comments;

        ws.DATA.SALDOC.push(saldocObj);

        //var shipInfo = getShipInfo(obj);
        //var mtrdocObj = {};
        //if (shipInfo.address)  mtrdocObj.SHIPPINGADDR = shipInfo.address;
        //if (shipInfo.zip)	     mtrdocObj.SHPZIP       = shipInfo.zip;
        //if (shipInfo.district) mtrdocObj.SHPDISTRICT  = shipInfo.district;
        //if (shipInfo.city)     mtrdocObj.SHPCITY      = shipInfo.city;
        //if (mtrdocObj.length != 0 && mtrdocObj.length != null )
        //{
        //	ws.DATA.MTRDOC = [];
        //	ws.DATA.MTRDOC.push(mtrdocObj);
        //}
        //ws.DATA.MTRDOC.push(mtrdocObj);

        for (i in obj.items) {
            //*** Έλεγχος για ύπραξει είδους ***//
            codeSearch = checkItemWithCustomSku(obj.items[i].srchcode);
            if (codeSearch.success) srchcode = codeSearch.code;
            else srchcode = obj.items[i].srchcode;

            var iteLinesObj = {};
            iteLinesObj.LINENUM = i;
            iteLinesObj.SRCHCODE = srchcode;
            iteLinesObj.QTY1 = obj.items[i].qty;
            iteLinesObj.PRICE = obj.items[i].price;
            iteLinesObj.DISC1VAL = obj.items[i].discountvalue;
            //iteLinesObj.LINEVAL = obj.items[i].value;
            ws.DATA.ITELINES.push(iteLinesObj);
        }

        for (i in obj.expenses) {
            var expanalObj = {};
            expanalObj.EXPN = obj.expenses[i].code;
            expanalObj.EXPVAL = obj.expenses[i].value;
            ws.DATA.EXPANAL.push(expanalObj);
        }

        //return ws;
        var result = X.WEBREQUEST(JSON.stringify(ws));
        result = JSON.parse(result);

        response.success = result.success;
        response.sum = result.data.SALDOC[0].SUMAMNT;
        //SALDOC:SUMAMNT;ITELINES:MTRL,MTRL_ITEM_CODE,MTRL_ITEM_NAME,QTY1,PRICE,DISC1PRC,DISC1VAL,DISC2PRC,DISC2VAL,DISC3PRC,DISC3VAL,LINEVAL;EXPANAL:EXPN,EXPVAL
        for (i in result.data.ITELINES) {
            //return result.data.ITELINES;
            resItelines = {};
            resItelines.id = result.data.ITELINES[i].MTRL;
            resItelines.code = result.data.ITELINES[i].MTRL_ITEM_CODE;
            resItelines.name = result.data.ITELINES[i].MTRL_ITEM_NAME;
            resItelines.qty1 = result.data.ITELINES[i].QTY1;
            resItelines.price = result.data.ITELINES[i].PRICE;
            //resItelines.price = 150;
            resItelines.discount1prc = result.data.ITELINES[i].DISC1PRC;
            resItelines.discount1value = result.data.ITELINES[i].DISC1VAL;
            //resItelines.discount1value = '50,5';
            resItelines.discount2prc = result.data.ITELINES[i].DISC2PRC;
            resItelines.discount2value = result.data.ITELINES[i].DISC2VAL;
            //resItelines.discount2value = 100;
            resItelines.discount3prc = result.data.ITELINES[i].DISC3PRC;
            resItelines.discount3value = result.data.ITELINES[i].DISC3VAL;
            resItelines.value = result.data.ITELINES[i].LINEVAL;
            resItelines.vat = result.data.ITELINES[i].VATAMNT;
            //resItelines.value = '1.514,5';
            //expanalObj.EXPVAL = obj.expenses[i].price;
            response.items.push(resItelines);
        }

        for (i in result.data.EXPANAL) {
            //return result.data.ITELINES;
            resExpenses = {};
            resExpenses.code = result.data.EXPANAL[i].EXPN;
            resExpenses.value = result.data.EXPANAL[i].EXPVAL;
            //expanalObj.EXPVAL = obj.expenses[i].price;
            response.expenses.push(resExpenses);
        }
        return response;
        //return JSON.parse(result);
    } catch (e) {
        return responseError(
            "Error in calculating order. Error Message: " + e.message,
            false
        );
    } finally {
        obj.FREE;
        obj = null;
    }

    //return response;
}

// DESCRIPTION: Creates a Item.
// ---------------------------------------------------------------
function setItem(obj) {
    debugger;
    // if (!fieldHasValue(obj.code) || !fieldHasValue(obj.name))
    //     return responseError(
    //         "Could not create product. Null code or name! ",
    //         false
    //     );

    // ============================================
    try {
        debugger;
        response = {};
        var response = initializeResponse(true);
        var a = [];
        for (i in obj.items) {
            var ws = {};
            ws.SERVICE = "setData";
            ws.OBJECT = "ITEM";
            ws.appid = obj.appId;
            //ws.key = cusdata.trdr;
            var itemMtrl = getItemMtrl(obj.items[i].code);
            if (itemMtrl.success) ws.key = itemMtrl.mtrl;
            ws.DATA = {};
            ws.DATA.ITEM = [];
            ws.DATA.ITEEXTRA = [];	//vka -- 08/08/2023
            var itemVal = {};
            var itemValExtra = {};	//vka -- 08/08/2023
            // var itemVal = [];
            itemVal.name = obj.items[i].name;
            itemVal.CCCCLESHOPNAME = obj.items[i].name;
            itemVal.code = obj.items[i].code;
            if (itemMtrl.mtrl == 0) { // Αν δεν υπάρχει το είδος
                itemVal.VAT = obj.items[i].vatcode;
                itemVal.MTRUNIT1 = obj.items[i].mmcode;
                if (obj.items[i].mmcodebuy) itemVal.MTRUNIT3 = obj.items[i].mmcodebuy; else itemVal.MTRUNIT3 = obj.items[i].mmcode;
                if (obj.items[i].mmcodesell) itemVal.MTRUNIT4 = obj.items[i].mmcodesell; else itemVal.MTRUNIT4 = obj.items[i].mmcode;
            }
            if (obj.items[i].mpn) itemVal.CODE2 = obj.items[i].mpn;
            if (obj.items[i].weight) itemVal.WEIGHT = obj.items[i].weight;
            if (obj.items[i].pricew) itemVal.PRICEW = obj.items[i].pricew;
            if (obj.items[i].regularprice) itemVal.PRICER = obj.items[i].regularprice;
            if (obj.items[i].saleprice) itemVal.PRICER02 = obj.items[i].saleprice;
            if (obj.items[i].supplierurl) itemVal.CCC1049WebPage = obj.items[i].supplierurl;											//vka -- 08/08/2023
            if (obj.items[i].availability) itemValExtra.UTBL01 = obj.items[i].availability;												//vka -- 08/08/2023
            if (obj.items[i].suppliername) itemValExtra.UTBL03 = checkSupplierName(obj.items[i].suppliername);		//vka -- 08/08/2023
            if (obj.items[i].extsupplier) itemValExtra.UTBL03 = obj.items[i].extsupplier;	// Προμηθευτής Εξωτρικού	
            itemVal.MTRACN = 101	//vka -- 08/08/2023
            itemVal.MTRSNUSE = 2 //vka -- 08/08/2023
            itemVal.APVCODE = obj.items[i].code; //vka -- 08/08/2023
            if (obj.items[i].category) itemVal.MTRCATEGORY = obj.items[i].category;	//vka -- 08/08/2023
            if (obj.items[i].barcode) itemVal.CODE1 = obj.items[i].barcode;		//vka -- 08/08/2023
            if (obj.items[i].purchaseprice) itemVal.CCC1049SUPPRICE = obj.items[i].purchaseprice;	//vka -- 08/08/2023
            ws.DATA.ITEM.push((itemVal));
            ws.DATA.ITEEXTRA.push((itemValExtra));	//vka -- 08/08/2023
            // X.LOG("updateCustomerData: " + JSON.stringify(ws));
            var result = X.WEBREQUEST(JSON.stringify(ws));
            res = JSON.parse(result);
            // if (res.success) a.push((res)); else a.push('code: [' + obj.items[i].code + '] - Err: [' + res.error + ']');
            a.push(res);
        }
        response.totalcount = obj.items.length;
        response.data = (a);
    } catch (e) {
        return responseError(
            "Error in Item order. Error Message: " + e.message,
            false
        );
    } finally {
        obj.FREE;
        obj = null;
    }
    // ============================================

    // var objITEM = X.CREATEOBJ("ITEM");
    // var tblMTRL = objITEM.FINDTABLE("MTRL");
    // var tblMTREXTRA = objITEM.FINDTABLE("MTREXTRA");
    // try {

    //     if (obj.id) {
    //         objITEM.DBLOCATE(obj.id);
    //     }
    //     else {
    //         objITEM.DBINSERT;
    //     }
    //     objITEM.EDIT;


    //     // objITEM.DBINSERT;
    //     // objITEM.EDIT;

    //     tblMTRL.CODE = obj.code;
    //     tblMTRL.NAME = obj.name;
    //     if (obj.mmid) tblMTRL.MTRUNIT1 = obj.mmid; // "101"; //τεμάχ.
    //     if (obj.vatid) tblMTRL.VAT = obj.vatid; //"1410"; //24%

    //     if (obj.barcode) tblMTRL.CODE1 = obj.barcde;

    //     newid = objITEM.DBPOST;
    //     var response = initializeResponse(false);
    //     response.id = newid;
    // } catch (e) {
    //     return responseError(
    //         "Error in Item order. Error Message: " + e.message,
    //         false
    //     );
    // } finally {
    //     obj.FREE;
    //     obj = null;
    // }

    return response;
}

// ---------------------------------------------------------------
