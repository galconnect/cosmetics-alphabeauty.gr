//// ConnectLineB2BConnector.getDocs
/// -----------------------------------------------
/// LAST UPDATE -> 2023-09-26 12:54 - galex
/// -----------------------------------------------
lib.include("ConnectLineEshopCommon.common");

function getSeries(obj) {
    if (customerNeedsInvoice(obj) == true)
        return 7024;
    return 7024;
}

// ---------------------------------------------------------------
// DESCRIPTION: Gets if an order exists.
// ---------------------------------------------------------------
function getOrderExists(obj) {
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere = " where f.COMPANY=" + X.SYS.COMPANY + " and f.SOSOURCE=1351 and f.SOREDIR=0 and f.SODTYPE=13 and f.series = " + getSeries(obj);

    //if(obj.webid == 116259)
    //	obj.webid = 116249;

    if (fieldHasValue(obj.webid))
        dsSqlWhere += " and f.FINCODE = '" + "HDM-" + obj.webid + "' ";

    //dsSqlWhere += " and f.int02 = " + obj.webid;	

    if (obj.erpid && obj.erpid != "")
        dsSqlWhere += " and f.int02 = " + obj.erpid;

    // Query Order
    dsSqlOrder = " order by f.TRNDATE desc, f.FINDOC ";

    dsSql = "select f.FINDOC " +
        "from FINDOC f ";

    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    //return dsSql; 
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    response.data = JSON.parse(dsData.JSON);

    return response;
}

// ---------------------------------------------------------------
// DESCRIPTION: Gets the customers
// ---------------------------------------------------------------
function getCustomers(obj) {
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    var dsSqlWhere = "where c.COMPANY=:1 and c.SODTYPE=13 ";

    if (fieldHasValue(obj.id)) {
        dsSqlWhere += " and c.TRDR='" + obj.id + "'";
    } else {
        if (fieldHasValue(obj.afm)) {
            dsSqlWhere += " and c.AFM='" + obj.afm + "'";
        } else {
            // if (fieldHasValue(obj.code))
            //     dsSqlWhere += " and c.CODE='" + obj.code + "'";
            if (fieldHasValue(obj.email))
                dsSqlWhere += " and c.EMAIL='" + obj.email + "'";
            if (fieldHasValue(obj.phone))
                dsSqlWhere += " and (c.PHONE01 LIKE '%" + obj.phone + "%' or c.PHONE02 LIKE '%" + obj.phone + "%') ";
        }
        if (fieldHasValue(obj.trdcategory))
            dsSqlWhere += " and c.TRDCATEGORY = " + obj.trdcategory;
    }
    // Query Order
    dsSqlOrder = " order by c.CODE DESC, c.TRDR DESC";

    dsSql = "select top 1 c.TRDR as customer_id " +
        "from TRDR c " + dsSqlWhere + dsSqlOrder;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    response.data = JSON.parse(dsData.JSON);
    //response.data = dsSqlWhere;

    return response;
}


// ---------------------------------------------------------------
// DESCRIPTION: Gets the customers details
// ---------------------------------------------------------------
function getCustomerInfo(obj) {
    // Initialize response array
    var response = initializeResponse(true);
    debugger;
    // Query Filters
    var dsSqlWhere = "where c.COMPANY=:1 and c.SODTYPE=13 ";

    if (fieldHasValue(obj.code))
        dsSqlWhere += " and c.CODE='" + obj.code + "'";

    if (fieldHasValue(obj.name))
        dsSqlWhere += " and c.NAME like '" + obj.name + "'";

    if (fieldHasValue(obj.afm))
        dsSqlWhere += " and c.AFM='" + obj.afm + "'";

    if (fieldHasValue(obj.email))
        dsSqlWhere += " and c.EMAIL like '" + obj.email + "'";

    // if (fieldHasValue(obj.trdcategory))
    //     dsSqlWhere += " and c.TRDCATEGORY = " + obj.trdcategory;

    if (fieldHasValue(obj.phone))
        dsSqlWhere += " and (c.PHONE01 LIKE '%" + obj.phone + "%' or c.PHONE02 LIKE '%" + obj.phone + "%') ";

    if (fieldHasValue(obj.upddate)) {
        // dsSqlWhere += "and A.UPDDATE >= '" + obj.upddate + "' ";
        dsSqlWhere += "and c.UPDDATE >= DATEADD(hour,-2," + formatDateTime(obj.upddate) + ") ";
    }

    // Query Order
    dsSqlOrder = "order by c.CODE, c.TRDR";

    dsSql = "select c.TRDR as CLIENT_ID, c.CODE, c.NAME, c.AFM, c.IRSDATA, c.ADDRESS, c.ZIP, c.DISTRICT, c.CITY, c.PHONE01, c.PHONE02, c.EMAIL  " +
        "FROM TRDR c " + dsSqlWhere + dsSqlOrder;

    // return dsSql; 
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    response.data = JSON.parse(dsData.JSON);
    //response.data = dsSqlWhere;

    return response;
}

// ---------------------------------------------------------------
// DESCRIPTION: Check if item exist, if not create it.
// ---------------------------------------------------------------
//unction checkItem(itemData)
//
//response = {};
//response.success = "true";
//		
//

// ---------------------------------------------------------------
// DESCRIPTION: Gets if an item exists.
// ---------------------------------------------------------------
function checkItemWithCustomSku(sku) {
    //debugger;
    //return sku;
    if ((sku == 0) || sku == null)
        return false;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere = " WHERE COMPANY=" + X.SYS.COMPANY + " AND SODTYPE = 51 AND ISACTIVE = 1 AND CCCCLVARCHAR02 = '" + sku + "' ";


    // Query Order
    //dsSqlOrder = " order by f.TRNDATE desc, f.FINDOC " ;

    dsSql = "SELECT ISNULL(CODE,0) as CODE FROM MTRL ";

    dsSql = dsSql + dsSqlWhere;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    //return dsSql;
    //response.data = JSON.parse(dsData.JSON);
    dsData.FIRST;
    while (!dsData.EOF()) {
        if (dsData.CODE == 0) {
            response.success = false;
            response.code = 0;
        }
        else {
            response.success = true;
            response.code = dsData.CODE;
        }
        return response;
    }
    //return dsData;
    return false;
}

// ---------------------------------------------------------------
// DESCRIPTION: Gets if an item exists.
// ---------------------------------------------------------------
function checkItem(sku) {
    //return sku;
    if ((sku == 0) || sku == null)
        return false;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere = " WHERE COMPANY=" + X.SYS.COMPANY + " AND SODTYPE = 51 AND ISACTIVE = 1 AND CCCCLWEBSKU = '" + sku + "' ";


    // Query Order
    //dsSqlOrder = " order by f.TRNDATE desc, f.FINDOC " ;

    dsSql = "SELECT ISNULL(CODE,0) as CODE FROM MTRL ";

    dsSql = dsSql + dsSqlWhere;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    //return dsSql;
    //response.data = JSON.parse(dsData.JSON);
    dsData.FIRST;
    while (!dsData.EOF()) {
        if (dsData.CODE == 0) {
            response.success = false;
            response.code = 0;
        }
        else {
            response.success = true;
            response.code = dsData.CODE;
        }
        return response;
    }
    //return dsData;
    return false;
}

function getColor(product_code, color) {
    dsSql = "SELECT CD1.cdimlines " +
        " FROM MTRL A   " +
        " LEFT OUTER JOIN CDIMLINES CD1 ON CD1.COMPANY = A.COMPANY AND CD1.CDIM = A.CDIM1  " +
        " WHERE A.CODE = '" + product_code + "' AND CD1.NAME = '" + color + "'";
    //return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    dsData.FIRST;

    return dsData.cdimlines;
}

function getDimension(product_code, size) {
    dsSql = dsSql = "SELECT CD2.cdimlines " +
        " FROM MTRL A   " +
        " LEFT OUTER JOIN CDIMLINES CD2 ON CD2.COMPANY = A.COMPANY AND CD2.CDIM = A.CDIM2  " +
        " WHERE A.CODE = '" + product_code + "' AND CD2.NAME = '" + size + "'";
    //return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    dsData.FIRST;

    return dsData.cdimlines;
}


// ---------------------------------------------------------------
// DESCRIPTION: Gets orders status
// ---------------------------------------------------------------
function getOrdersStatus(obj) {
    var strExtraWhere = " WHERE FS.FINSTATES IS NOT NULL AND F.COMPANY = " + X.SYS.COMPANY;
    var strSort = " ORDER BY F.TRNDATE DESC";
    var response = initializeResponse(true);

    if (obj.update) strExtraWhere += " AND f.UPDDATE >= '" + obj.update + "'";
    if (obj.status) strExtraWhere += " AND FS.FINSTATES = '" + obj.status + "'";
    if (obj.orderid) strExtraWhere += " AND F.FINDOC = " + obj.orderid + " ";
    if (obj.ordercode) strExtraWhere += " AND F.FINCODE like '" + obj.ordercode + "'";

    strqry = " SELECT  F.FINDOC as orderid, f.UPDDATE as date,  F.FINCODE as orderCode,  FS.FINSTATES as statusCode, FS.NAME as state "
        + " FROM FINDOC F "
        + " LEFT JOIN FINSTATES FS ON F.FINSTATES = FS.FINSTATES AND F.COMPANY = FS.COMPANY ";

    dsSql = strqry + strExtraWhere + strSort;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    response.data = JSON.parse(dsData.JSON);
    return response;
}


function getCountryCodeFromIntercode(countrySlag) {
    // if ($isBilling) var countrySlag = obj.billinfo.country; else var countrySlag = obj.shipinfo.country;
    var strExtraWhere = "  WHERE ISACTIVE = 1 AND INTERCODE = '" + countrySlag + "' ";
    var response = initializeResponse(true);
    strqry = "SELECT COUNTRY FROM COUNTRY";
    dsSql = strqry + strExtraWhere;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    response.totalcount = dsData.RECORDCOUNT;
    response.data = JSON.parse(dsData.JSON);
    return response;
}

// ---------------------------------------------------------------
// DESCRIPTION: Gets if an item exists or create
// ---------------------------------------------------------------
function getItemMtrl(sku) {
    //debugger;
    //return sku;
    if (sku == 0 || sku == null) return false;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere =
        " WHERE COMPANY=" +
        X.SYS.COMPANY +
        " AND SODTYPE = 51 AND CODE = '" +
        sku +
        "' ";
    dsSql = "SELECT ISNULL(MTRL,0) as mtrl FROM MTRL ";

    dsSql = dsSql + dsSqlWhere;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    //return dsSql;
    //response.data = JSON.parse(dsData.JSON);
    dsData.FIRST;
    while (!dsData.EOF()) {
        if (dsData.mtrl == 0) {
            response.success = false;
            response.mtrl = 0;
        } else {
            response.success = true;
            response.mtrl = dsData.mtrl;
        }
        return response;
    }
    //return dsData;
    return false;
}



function getOrderBilingInfo(webid) {
    if (webid == 0 || webid == null) return false;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere =
        " WHERE F.FINCODE = '" + webid + "'  ";
    dsSql = "SELECT C.TRDR as id, C.CODE as code, C.NAME as name, C.ADDRESS as address, C.CITY as city, C.ZIP as zip, C.district as district, C.EMAIL as email, C.PHONE01 as phone1, C.COUNTRY as country, C.AFM as afm, C.IRSDATA as doy " +
        "from TRDR C INNER JOIN FINDOC F ON (F.TRDR = C.TRDR)";

    dsSql = dsSql + dsSqlWhere;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    //return dsSql;
    //response.data = JSON.parse(dsData.JSON);
    dsData.FIRST;
    while (!dsData.EOF()) {
        if (dsData.NAME == "") {
            response.success = false;
            response.error = "No Data";
        } else {
            response.success = true;
            response.data = JSON.parse(dsData.JSON);
        }
        return response;
    }
    return false;

}

function getOrderShipinfo(webid) {
    if (webid == 0 || webid == null) return false;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere =
        " WHERE F.FINCODE = '" + webid + "'  ";
    dsSql = "SELECT  F.CCCParaliptisName as name, M.SHIPPINGADDR as address, M.SHPCITY as city, M.SHPZIP as zip, M.SHPDISTRICT as district, M.SHPCOUNTRY as country " +
        " from  FINDOC F " +
        "INNER JOIN MTRDOC M ON (M.FINDOC = F.FINDOC) ";

    dsSql = dsSql + dsSqlWhere;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    dsData.FIRST;
    while (!dsData.EOF()) {
        if (dsData.NAME == "") {
            response.success = false;
            response.error = "No Data";
        } else {
            response.success = true;
            response.data = JSON.parse(dsData.JSON);
        }
        return response;
    }
    return false;

}

function getOrderItems(id) {
    if (id == 0 || id == null) return false;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere =
        " WHERE F.FINDOC = '" + id + "'  ";
    dsSql = "select  C.CODE as code, F.QTY1 as qty1, F.PRICE as price, F.LINEVAL as total " +
        " from MTRLINES F " +
        "INNER JOIN MTRL C on C.MTRL = F.MTRL ";

    dsSql = dsSql + dsSqlWhere;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    dsData.FIRST;
    while (!dsData.EOF()) {
        if (dsData.NAME == "") {
            response.success = false;
            response.error = "No Data";
        } else {
            response.success = true;
            response.data = JSON.parse(dsData.JSON);
        }
        return response;
    }
    return false;

}


function getOrderExp(id) {
    if (id == 0 || id == null) return false;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere =
        " WHERE FINDOC = '" + id + "'  ";
    dsSql = "select EXPN as expn, EXPVAL as expval from EXPANAL ";

    dsSql = dsSql + dsSqlWhere;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    dsData.FIRST;
    while (!dsData.EOF()) {
        if (dsData.NAME == "") {
            response.success = false;
            response.error = "No Data";
        } else {
            response.success = true;
            response.data = JSON.parse(dsData.JSON);
        }
        return response;
    }
    return false;

}