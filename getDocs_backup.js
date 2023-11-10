//// ConnectLineB2BConnector.getDocs
/// -----------------------------------------------
/// LAST UPDATE -> 2022-12-02 15:52 - galex
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

    if (fieldHasValue(obj.code))
        dsSqlWhere += " and c.CODE='" + obj.code + "'";

    //if (fieldHasValue(obj.name))
    //	dsSqlWhere += " and c.NAME='" + obj.name + "'";
		
    if (fieldHasValue(obj.afm))
        dsSqlWhere += " and c.AFM='" + obj.afm + "'";
    else
        return response.success = "";

    if (fieldHasValue(obj.email))
        dsSqlWhere += " and c.EMAIL='" + obj.email + "'";

    if (fieldHasValue(obj.trdcategory))
        dsSqlWhere += " and c.TRDCATEGORY = " + obj.trdcategory;

    if (fieldHasValue(obj.phone))
        dsSqlWhere += " and (c.PHONE01 LIKE '%" + obj.phone + "%' or c.PHONE02 LIKE '%" + obj.phone + "%') ";

    // Query Order
    dsSqlOrder = "order by c.CODE, c.TRDR";

    dsSql = "select top 2 c.TRDR as customer_id " +
        "from TRDR c " + dsSqlWhere + dsSqlOrder;
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

function getOrderStatus(obj) {
    var strExtraWhere = " WHERE FS.FINSTATES IS NOT NULL AND F.COMPANY = " + X.SYS.COMPANY;
    var strSort = " ORDER BY F.TRNDATE DESC";
    var response = initializeResponse(true);

    // if (obj.eshopid) strExtraWhere += " AND f.CCCMAGENTO = '" + obj.eshopid + "'";
    if (obj.update) strExtraWhere += " AND f.UPDDATE >= '" + obj.update + "'";
    if (obj.status)
        strExtraWhere += " AND FS.FINSTATES = '" + obj.status + "'";
    else
        strExtraWhere += " AND FS.FINSTATES = '103'";

    strqry = " SELECT  F.FINDOC as orderid,  FS.FINSTATES as statusCode, "
        + " CASE FS.FINSTATES WHEN 100 THEN 'pending' WHEN 101 THEN 'processing' WHEN 102 THEN 'complete' WHEN 103 THEN 'canceled' ELSE '' END AS status "
        // + " ,CASE FS.FINSTATES WHEN 100 THEN 'new' WHEN 101 THEN 'processing' WHEN 102 THEN 'complete' WHEN 103 THEN 'canceled' ELSE '' END AS state "
        + " FROM FINDOC F "
        + " LEFT JOIN FINSTATES FS ON F.FINSTATES = FS.FINSTATES AND F.COMPANY = FS.COMPANY ";

    dsSql = strqry + strExtraWhere + strSort;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    response.data = JSON.parse(dsData.JSON);
    //response.data = dsSqlWhere;
    return response;
}

function getOrdersStatus_bak(obj) {
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere = "where f.COMPANY=" + X.SYS.COMPANY + " and f.SOSOURCE=1351 and f.SOREDIR=0 and f.SODTYPE=13 ";

    if (fieldHasValue(obj.date))
        dsSqlWhere += "and f.TRNDATE = '" + obj.date + "' ";

    if (fieldHasValue(obj.datefrom) && fieldHasValue(obj.dateto))
        dsSqlWhere += "and f.TRNDATE >= '" + obj.datefrom + "' and f.TRNDATE < '" + obj.dateto + "' ";

    if (fieldHasValue(obj.webid))
        dsSqlWhere += "and f.FINDOC = " + obj.webid;

    // Query Order
    dsSqlOrder = "order by f.TRNDATE desc, f.FINDOC ";

    dsSql = "select f.FINDOC AS ERPID, f.FINDOC AS WEBID, f.TRNDATE AS DATE, f.TRDR AS CUSTOMERID," +
        "(case when f.FULLYTRANSF = 1 then 'completed' else 'No' end) AS INVOINCED " +
        "from FINDOC f " +
        "join MTRDOC d on d.FINDOC = f.FINDOC " +
        "join TRDR c on c.TRDR = f.TRDR " +
        "left join TRDEXTRA e on e.TRDR = c.TRDR and e.TRDR = f.TRDR ";

    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    response.data = JSON.parse(dsData.JSON);

    return response;
}

