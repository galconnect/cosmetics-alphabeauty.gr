//// ConnectLineB2BConnector.getMasterData
/// -----------------------------------------------
/// LAST UPDATE -> 2023-09-27 12:26 - galex
/// -----------------------------------------------

function testResponse(obj) {
    var str = "";
    str = str.replace(/[^\x00-\x7F]/g, "");
    return str;
}


function getItems(obj) {
    // debugger
    // return;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere = " where A.COMPANY = " + X.SYS.COMPANY + " AND A.SODTYPE = 51 AND A.ISACTIVE = 1 AND A.CCCCLESHOPSYNC = 1 AND a.RELITEM IS NULL ";// AND A.CODE = 'Π0010' AND A.cccclimgcode = 'BIEN-1600386-001'
    if (fieldHasValue(obj.code))
        dsSqlWhere += "and A.CODE = '" + obj.code + "' ";
    if (fieldHasValue(obj.itemid))
        dsSqlWhere += "and A.MTRL = " + obj.itemid + " ";
    if (fieldHasValue(obj.upddate)) {
        // dsSqlWhere += "and A.UPDDATE >= '" + obj.upddate + "' ";
        dsSqlWhere += "and A.UPDDATE >= DATEADD(hour,-2," + formatDateTime(obj.upddate) + ") ";
    }
    // Query Order
    dsSqlOrder = " order by A.CODE, A.MTRL ";




    /*Main Query of master table*/
    dsSql = "SELECT A.MTRL AS ITEMID, A.CODE AS SKU, U.NAME AS UNIT, A.VAT AS VATID, V.NAME AS VAT, A.UPDDATE AS UPDDATE, " +
        " A.NAME AS NAME,  A.CCCCLESHOPNAME as SHOPNAME, A.CCCCLESHOPDTDESC as DESCRIPTION, " +
        " ISNULL(A.CODE1,0) AS BARCODE, A.ISACTIVE, " +
        " ISNULL(A.PRICEW, 0) AS PRICE, ISNULL(A.PRICER, 0) AS LIANIKI, ISNULL(A.SODISCOUNT, 0) AS EKPTOSILIANIKIS,  ISNULL(A.GWEIGHT, 0) AS WEIGHT, A.MTRMANFCTR AS BRANDID, " +
        " convert(varchar, getdate(), 20) AS SQLDATE " +
        " , M.NAME AS BRAND " +
        " , A.CCCCLESHOPSHOW AS VISIBILITY " +

        " ,ISNULL((SELECT (-1) * ISNULL((SELECT SUM(ISNULL(Z1.QTY1,0)-ISNULL(Z1.QTY1COV,0)-ISNULL(Z1.QTY1CANC,0))  " +
        " FROM MTRLINES Z1, RESTMODE Z2  WHERE Z1.MTRL = A.MTRL   " +
        " AND Z1.PENDING   = 1 AND Z1.WHOUSE IN (" + whouses + ")  " +
        " AND Z2.COMPANY   =  " + X.SYS.COMPANY + " AND Z1.RESTMODE  = Z2.RESTMODE AND Z2.RESTCATEG = 2),0)),0) +" +
        " ISNULL((SELECT SUM(A1.IMPQTY1-A1.EXPQTY1) " +
        "          FROM   MTRBALSHEET A1 " +
        "          WHERE  A1.COMPANY= " + X.SYS.COMPANY + " AND A1.MTRL=A.MTRL AND A1.FISCPRD=YEAR(getdate()) AND A1.PERIOD <MONTH(GETDATE()) AND A1.WHOUSE IN (" + whouses + ") ),0) " +
        " +ISNULL((SELECT SUM(A2.QTY1*(B2.FLG01-B2.FLG04)) " +
        "          FROM   MTRTRN A2,TPRMS B2 " +
        "          WHERE  A2.COMPANY= " + X.SYS.COMPANY + " " +
        "          AND    A2.SODTYPE = 51 AND    A2.MTRL =A.MTRL  AND    A2.TRNDATE >=DATEADD(month, DATEDIFF(month, 0, getdate()), 0) AND    A2.TRNDATE <=GETDATE() AND A2.WHOUSE IN (" + whouses + ") " +
        "          AND    A2.COMPANY = B2.COMPANY  AND    A2.SODTYPE = B2.SODTYPE AND    A2.TPRMS = B2.TPRMS),0) AS STOCK  " +

        // " ISNULL((select SUM((L3.QTY1-L3.qty1cov-L3.qty1canc)*(B3.FLG04)) " +
        // " from mtrtrn A3, TPRMS B3, findoc F3, mtrlines L3 " +
        // " where A3.tprms=B3.tprms  " +
        // " and A3.sodtype=B3.sodtype and A3.sodtype=51 and A3.company=B3.company and F3.findoc=A3.findoc and F3.sosource=1351 and F3.series in (7101,7285,7786,7401) " +
        // " and A3.mtrl=a.mtrl and F3.fullytransf in (0,2) and F3.iscancel=0  and F3.shipkind in (1105,1114,1138,1000,1143) and L3.findoc=F3.findoc and L3.mtrl=A3.mtrl " +
        // " and L3.pending=1 and L3.findoc=A3.findoc and A3.mtrtrn=L3.mtrlines and A3.linenum=1 and A3.mtrtrn=L3.mtrlines and A3.linenum=1),0) AS PARAKATATHIKI " +

        " FROM MTRL A    " +
        " INNER JOIN MTREXTRA C ON C.MTRL = A.MTRL AND C.SODTYPE = A.SODTYPE AND C.COMPANY = A.COMPANY " +
        " LEFT JOIN MTRMANFCTR M ON M.MTRMANFCTR = A.MTRMANFCTR AND M.COMPANY = A.COMPANY " +
        " LEFT JOIN VAT V ON V.VAT = A.VAT " +
        " LEFT JOIN MTRUNIT U ON U.MTRUNIT = A.MTRUNIT1 AND U.COMPANY = A.COMPANY " +
        dsSqlWhere;
    //" and a.mtrl in (select distinct A.mtrl from mtrl A " + dsSqlWhere + " and A.CCCPARENTCODE <> '') " ;

    dsSql = dsSql + dsSqlOrder;//+ " offset 3272 rows "
    // return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY, X.SYS.COMPANY, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    currentPCode = '';
    dsData.FIRST;
    while (!dsData.EOF()) {

        response.data.push({
            "ITEMID": dsData.ITEMID,
            "CODE": dsData.SKU,
            "NAME": dsData.NAME,
            "SHOPNAME": dsData.SHOPNAME,
            // "DESCRIPTIONHTML": dsData.DESCRIPTIONHTML,
            "BARCODE": dsData.BARCODE,
            "PRICE": dsData.PRICE,
            "LIANIKI": dsData.LIANIKI,
            // "DISCOUNT": dsData.EKPTOSILIANIKIS,
            // "VATID": dsData.VATID,
            // "VAT": dsData.VAT,
            // "UNIT": dsData.UNIT,
            "STOCK": dsData.STOCK,
            // "PARAKATATHIKI": dsData.PARAKATATHIKI,
            // "WEIGHT": dsData.WEIGHT,
            // "DIMENSION01": dsData.DIMENSION01,
            // "DIMENSION02": dsData.DIMENSION02,
            // "DIMENSION03": dsData.DIMENSION03,
            // "BRANDID": dsData.BRANDID,
            // "BRAND": dsData.BRAND,
            // "SQLDATE": dsData.SQLDATE,
            // "SQLDATE": dsData.UPDDATE,
            "VISIBILITY": dsData.VISIBILITY,
            // "CATEGORIES": [],
            // "VARIATIONS": [],
            // "ATTRIBUTES": []
        });
        dsData.NEXT;
    }

    // /*Categories*/
    // dsCategoriesSql = "SELECT c.mtrl as ITEMID, cat1.CCCCLWEBCATEGORIES as IDC1,  cat1.SODTYPE as TYPE1,  cat1.CODE  AS  CODEC1, cat1.NAME  AS  NAMEC1, " +
    //     "cat2.CCCCLWEBCATEGORIES as IDC2,  cat2.SODTYPE as TYPE2, cat2.CODE  AS  CODEC2, cat2.NAME  AS  NAMEC2, " +
    //     "cat3.CCCCLWEBCATEGORIES as IDC3,  cat3.SODTYPE as TYPE3, cat3.code  AS  CODEC3, cat3.NAME  AS  NAMEC3, " +
    //     "cat4.CCCCLWEBCATEGORIES as IDC4,  cat4.SODTYPE as TYPE4, cat4.CODE  AS  CODEC4, cat4.NAME  AS  NAMEC4, " +
    //     "cat5.CCCCLWEBCATEGORIES as IDC5,  cat5.SODTYPE as TYPE5, cat5.code  AS  CODEC5, cat5.NAME  AS  NAMEC5  " +
    //     " FROM CCCCLITEMCATEGORIES  c" +
    //     " left join  CCCCLWEBCATEGORIES cat1 on cat1.CCCCLWEBCATEGORIES = c.CCCCLCATEG1 AND cat1.sodtype=1  and cat1.COMPANY =  " + X.SYS.COMPANY +
    //     " left join  CCCCLWEBCATEGORIES cat2 on cat2.CCCCLWEBCATEGORIES = c.CCCCLCATEG2 AND cat2.sodtype=2  and cat2.COMPANY = " + X.SYS.COMPANY +
    //     " left join  CCCCLWEBCATEGORIES cat3 on cat3.CCCCLWEBCATEGORIES = c.CCCCLCATEG3 AND cat3.sodtype=3  and cat3.COMPANY =" + X.SYS.COMPANY +
    //     " left join  CCCCLWEBCATEGORIES cat4 on cat4.CCCCLWEBCATEGORIES = c.CCCCLCATEG2 AND cat4.sodtype=4  and cat4.COMPANY =" + X.SYS.COMPANY +
    //     " left join  CCCCLWEBCATEGORIES cat5 on cat5.CCCCLWEBCATEGORIES = c.CCCCLCATEG2 AND cat5.sodtype=5  and cat5.COMPANY = " + X.SYS.COMPANY;


    // dsCategoriesSql = dsCategoriesSql;
    // // return dsCategoriesSql;
    // dsCategories = X.GETSQLDATASET(dsCategoriesSql, X.SYS.COMPANY);

    // dsCategories.FIRST;
    // cat = [];
    // while (!dsCategories.EOF()) {
    //     vDataIndex = response.data.map(function (o) { return o.ITEMID; }).indexOf(dsCategories.ITEMID);
    //     if (vDataIndex == -1) {
    //         dsCategories.NEXT;
    //         continue;
    //     }

    //     if (dsCategories.IDC5 != "") {
    //         category_id = dsCategories.TYPE5 + "" + dsCategories.IDC5;
    //         category_name = dsCategories.NAMEC5;
    //     } else if (dsCategories.IDC4 != "") {
    //         category_id = dsCategories.TYPE4 + "" + dsCategories.IDC4;
    //         category_name = dsCategories.NAMEC4;
    //     } else if (dsCategories.IDC3 != "") {
    //         category_id = dsCategories.TYPE3 + "" + dsCategories.IDC3;
    //         category_name = dsCategories.NAMEC3;
    //     } else if (dsCategories.IDC2 != "") {
    //         category_id = dsCategories.TYPE2 + "" + dsCategories.IDC2;
    //         category_name = dsCategories.NAMEC2;
    //     } else if (dsCategories.IDC1 != "") {
    //         category_id = dsCategories.TYPE1 + "" + dsCategories.IDC1;
    //         category_name = dsCategories.NAMEC1;
    //     }

    //     // str_categories = "id , "; // `{ "CATEGORY_ID": ${category_id} },`;
    //     // cat.push({ "CATEGORY_ID": category_id });
    //     if (category_id) response.data[vDataIndex].CATEGORIES.push({
    //         "CATEGORY_ID": category_id,
    //         "CATEGORY_NAME": category_name
    //     });
    //     dsCategories.NEXT;
    // }



    /*Variations*
    dsVariationsSql = "select a.mtrl, a.code, a.name, a.pricew, a.pricew06, " +
        " a.ccccleshopshow as VISIBILITY  " +
        " from mtrl  a " +
        " where a.code is not null AND A.COMPANY = " + X.SYS.COMPANY + " AND A.SODTYPE = 51 AND A.ISACTIVE = 1 AND CCCCLESHOPSYNC = 1 " +
        " order by a.code asc";


    //dsVariationsSql = dsVariationsSql + dsSqlWhere + dsVariationsWhere + dsSqlOrder;

    dsVariations = X.GETSQLDATASET(dsVariationsSql, X.SYS.COMPANY);
    //
    dsVariations.FIRST;
    while (!dsVariations.EOF()) {
        vDataIndex = response.data.map(function (o) { return o.SKU; }).indexOf(dsVariations.CCCPARENTCODE);

        if (vDataIndex == -1) {
            dsVariations.NEXT;
            continue;
        }

        response.data[vDataIndex].VARIATION1 = 1000;
        response.data[vDataIndex].VARIATIONNAME1 = 'VARIATION';

        //if(dsVariations.CCCPARENTCODE == 'v-ualo')
        //	pname = dsVariations.PNAME.replace(",", ".");
        //else
        //	pname = dsVariations.PNAME;
        response.data[vDataIndex].VARIATIONS.push({
            "BARCODE": dsVariations.code,
            // "PHOTO": dsVariations.cccclimgcode,
            "VARIATIONOPTIONS": [{
                //"VALUE1": dsVariations.VARIATIONID1 > 0 ? dsVariations.VARIATIONID1 +'-'+ dsVariations.VARIATIONIDVALUE1 : "",
                //"VALUE2": dsVariations.VARIATIONID2 > 0 ? dsVariations.VARIATIONID2 +'-'+ dsVariations.VARIATIONIDVALUE2 : "",
                //"VALUE3": dsVariations.VARIATIONID3 > 0 ? dsVariations.VARIATIONID3 +'-'+ dsVariations.VARIATIONIDVALUE3 : "",
                "VALUE1": dsVariations.PNAME.replace(/,/g, '.'),
                //"VALUE1": dsVariations.VARIATIONID1 > 0 ? dsVariations.VARIATIONIDVALUE1 : "",
                //"VALUE2": dsVariations.VARIATIONID2 > 0 ? dsVariations.VARIATIONIDVALUE2 : "",
                //"VALUE3": dsVariations.VARIATIONID3 > 0 ? dsVariations.VARIATIONIDVALUE3 : "",
            }],
            "PRICE": dsVariations.pricew,
            "SALESPRICE": dsVariations.pricew06,
            "STOCK": 100,
            "VISIBILITY": dsVariations.VISIBILITY
            //"ISACTIVE": dsVariations.ISACTIVE,
        });

        dsVariations.NEXT;
    }
    */

    // ///*Attributes*/
    // dsAttributesSql = "select m.mtrl as ITEMID, m.CCCCLCHARTYPE as type_id, t.name as type_name,m.CCCCLCHARVALS as value_id,v.name as value_name,m.CCCCLCHARVALT as value_free_name " +
    //     " from CCCCLITEMCHARCTYPE m " +
    //     " left join CCCCLCHARTYPE t on m.CCCCLCHARTYPE = t.CCCCLCHARTYPE " +
    //     " left join CCCCLVCHARLIST v on m.CCCCLCHARVALS = v.CCCCLVCHARLIST AND t.CCCCLCHARTYPE = v.CCCCLCHARTYPE ";

    // dsAttributesSql = dsAttributesSql;
    // // return dsAttributesSql;
    // dsAttributes = X.GETSQLDATASET(dsAttributesSql, X.SYS.COMPANY);

    // dsAttributes.FIRST;
    // while (!dsAttributes.EOF()) {
    //     vDataIndex = response.data.map(function (o) { return o.ITEMID; }).indexOf(dsAttributes.ITEMID);

    //     if (vDataIndex == -1) {
    //         dsAttributes.NEXT;
    //         continue;
    //     }

    //     var attrValue;
    //     if (!dsAttributes.value_name || dsAttributes.value_name == '') { attrValue = dsAttributes.value_free_name } else { attrValue = dsAttributes.value_name }
    //     response.data[vDataIndex].ATTRIBUTES.push({
    //         "ATTRIBUTEID": dsAttributes.type_id,
    //         "ATTRIBUTENAME": dsAttributes.type_name,
    //         "ATTRIBUTENAMEVALUE": attrValue
    //         // "ATTRIBUTENAMEVALUE": dsAttributes.value_name
    //     });

    //     dsAttributes.NEXT;
    // }

    return response;
}

function getCategories(obj) {
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere = " where A.COMPANY = " + X.SYS.COMPANY + " AND A.SODTYPE = 51 ";
    if (fieldHasValue(obj.category_id)) dsSqlWhere += " and A.mtrcategory = '" + obj.category_id + "' ";
    if (fieldHasValue(obj.name)) dsSqlWhere += " and A.NAME like '" + obj.name + "' ";
    // Query Order
    dsSqlOrder = " order by A.MTRCATEGORY ";
    dsSql = " SELECT A.MTRCATEGORY AS CAT_ID, A.NAME, A.SOHCODE AS PARENT, A.SODTYPE, A.ISACTIVE FROM MTRCATEGORY A ";


    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    //return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);



    response.totalcount = dsData.RECORDCOUNT;
    dsData.FIRST;
    rows = [];

    while (!dsData.EOF()) {
        categories = {};
        categories.CATEGORY_ID = dsData.CAT_ID;
        categories.NAME = dsData.NAME;
        // if (dsData.SODTYPE == 1)
        //     categories.PARENTID = "0";
        // else
        //     categories.PARENTID = (dsData.SODTYPE - 1) + "." + dsData.PARENT;
        // categories.CATEGORY_LEVEL = dsData.SODTYPE;
        // categories.ESHOPID = dsData.ESHOPID;
        categories.ISACTIVE = dsData.ISACTIVE;
        response.data.push(categories);

        dsData.NEXT;
    }
    //response.rows = rows;
    return response;
}

function getCategories_backup_custom(obj) {
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere = " where COMPANY = " + X.SYS.COMPANY;
    if (fieldHasValue(obj.code))
        dsSqlWhere += "and A.mtrcategory = '" + obj.category_id + "' ";
    // Query Order
    dsSqlOrder = " order by CCCCLWEBCATEGORIES,SODTYPE ";
    dsSql = " SELECT CCCCLWEBCATEGORIES AS CAT_ID, NAME, PARENT, SODTYPE, ESHOPID, ISACTIVE FROM CCCCLWEBCATEGORIES ";

    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    //return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);



    response.totalcount = dsData.RECORDCOUNT;
    dsData.FIRST;
    rows = [];

    while (!dsData.EOF()) {
        categories = {};
        categories.CATEGORY_ID = dsData.SODTYPE + "." + dsData.CAT_ID;
        categories.NAME = dsData.NAME;
        if (dsData.SODTYPE == 1)
            categories.PARENTID = "0";
        else
            categories.PARENTID = (dsData.SODTYPE - 1) + "." + dsData.PARENT;



        categories.CATEGORY_LEVEL = dsData.SODTYPE;
        categories.ESHOPID = dsData.ESHOPID;
        categories.ISACTIVE = dsData.ISACTIVE;
        response.data.push(categories);
        //response.data.push({        
        //    "CATEGORY_ID" : dsData.SODTYPE + "" + dsData.CAT_ID,
        //    "NAME" : dsData.NAME,
        //    "PARENTID" :  (dsData.SODTYPE - 1) + "" + dsData.PARENT,
        //    "CATEGORY_LEVEL" : dsData.SODTYPE
        //});



        dsData.NEXT;
    }
    //response.rows = rows;
    return response;
}

function getColours(obj) {
    // Initialize response array
    var response = initializeResponse(true);
    // Query Filters
    dsSqlWhere = " where C.ISACTIVE = " + 1;
    if (fieldHasValue(obj.code))
        dsSqlWhere += " and C.CCCCOLOUR = '" + obj.code + "' ";
    if (fieldHasValue(obj.name))
        dsSqlWhere += " and C.NAME like '" + obj.name + "' ";
    // Query Order
    dsSqlOrder = " order by C.CCCCOLOUR ";
    dsSql = "SELECT C.CCCCOLOUR, C.NAME, C.ISACTIVE  FROM CCCCOLOUR C ";

    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    //return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    dsData.FIRST;
    rows = [];

    while (!dsData.EOF()) {
        colours = {};
        colours.CODE = dsData.CCCCOLOUR;
        colours.NAME = dsData.NAME;
        colours.ISACTIVE = dsData.ISACTIVE;

        response.data.push(colours);
        dsData.NEXT;
    }
    return response;
}

function getSizes(obj) {
    // Initialize response array
    var response = initializeResponse(true);
    // Query Filters
    dsSqlWhere = " where S.ISACTIVE = " + 1;
    if (fieldHasValue(obj.code))
        dsSqlWhere += " and S.CCCSIZE = '" + obj.code + "' ";
    if (fieldHasValue(obj.name))
        dsSqlWhere += " and S.NAME like '" + obj.name + "' ";
    // Query Order
    dsSqlOrder = " order by S.CCCSIZE ";
    dsSql = "SELECT S.CCCSIZE, S.NAME, S.ISACTIVE  FROM CCCSIZE S ";

    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    //return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    dsData.FIRST;
    rows = [];

    while (!dsData.EOF()) {
        sizes = {};
        sizes.CODE = dsData.CCCSIZE;
        sizes.NAME = dsData.NAME;
        sizes.ISACTIVE = dsData.ISACTIVE;

        response.data.push(sizes);
        dsData.NEXT;
    }
    return response;
}



function getItemsStock(obj) {
    // debugger
    // return;
    // Initialize response array
    var response = initializeResponse(true);

    // Query Filters
    dsSqlWhere = " where A.COMPANY = " + X.SYS.COMPANY + " AND A.SODTYPE = 51 AND A.ISACTIVE = 1 AND A.CCCCLESHOPSYNC = 1 ";
    if (fieldHasValue(obj.code))
        dsSqlWhere += "and A.CODE = '" + obj.code + "' ";
    if (fieldHasValue(obj.itemid))
        dsSqlWhere += "and A.MTRL = " + obj.itemid + " ";
    if (fieldHasValue(obj.upddate)) {
        // dsSqlWhere += "and A.UPDDATE >= '" + obj.upddate + "' ";
        // dsSqlWhere += "and A.UPDDATE >= DATEADD(hour,-2," + formatDateTime(obj.upddate) + ") ";
        dsSqlWhere += " AND (DATEADD(hour,-2," + formatDateTime(obj.upddate) + ") = '1900/01/01 00:00:00' OR A.UPDDATE >= DATEADD(hour,-2," + formatDateTime(obj.upddate) + ") OR A.MTRL IN (SELECT DISTINCT M.MTRL FROM FINDOC F INNER JOIN MTRLINES M ON F.FINDOC=M.FINDOC WHERE F.UPDDATE>= DATEADD(hour,-2," + formatDateTime(obj.upddate) + ") AND M.MTRL=A.MTRL AND f.TFPRMS NOT IN(100,102,106,151,152,155,181,202,203,500,501,401,402,403,404) AND isnull(f.APPRV,0) = 1)) "
    }
    // Query Order
    dsSqlOrder = " order by A.CODE, A.MTRL ";

    /*Main Query of master table*/
    dsSql = "SELECT  A.MTRL AS ITEMID, A.CODE AS SKU, " +
        " A.ISACTIVE, " +
        " ISNULL(A.PRICEW, 0) AS PRICE, ISNULL(A.PRICER, 0) AS LIANIKI, ISNULL(A.PRICER01, 0) AS EKPTOSILIANIKIS, " +

        "Isnull((SELECT (-1) * Isnull((SELECT Sum(Isnull(Z1.qty1, 0)-Isnull(Z1.qty1cov, 0)-Isnull(Z1.qty1canc, 0)) FROM " +
        "   mtrlines Z1, restmode Z2 WHERE Z1.mtrl = A.mtrl " +
        "   AND Z1.pending = 1 AND Z1.whouse IN (" + whouses + ") AND Z2.company =  " + X.SYS.COMPANY + " AND " +
        "   Z1.restmode =  " +
        "   Z2.restmode AND Z2.restcateg = 2), 0)), 0) " +
        "   + Isnull((SELECT Sum(A1.impqty1-A1.expqty1) FROM mtrbalsheet A1 WHERE " +
        "   A1.company= " + X.SYS.COMPANY + " AND A1.mtrl=A.mtrl AND A1.fiscprd=Year(Getdate()) AND " +
        "   A1.period < " +
        "   Month( " +
        "   Getdate()) AND A1.whouse IN (" + whouses + ") ), 0) " +
        "   + Isnull((SELECT Sum(A2.qty1*(B2.flg01-B2.flg04)) FROM mtrtrn A2, tprms " +
        "   B2 WHERE " +
        "   A2.company= " + X.SYS.COMPANY + " AND A2.sodtype = 51 AND A2.mtrl =A.mtrl AND A2.trndate >= " +
        "   Dateadd( " +
        "   month, Datediff(month, 0, Getdate()), 0) AND A2.trndate <=Getdate() AND " +
        "   A2.whouse IN (" + whouses + ") AND A2.company = B2.company AND A2.sodtype = " +
        "   B2.sodtype AND " +
        "   A2.tprms " +
        "   = B2.tprms), 0)  AS STOCK" +

        " FROM MTRL A    " +
        " INNER JOIN MTREXTRA C ON C.MTRL = A.MTRL AND C.SODTYPE = A.SODTYPE AND C.COMPANY = A.COMPANY " +
        " LEFT JOIN MTRMANFCTR M ON M.MTRMANFCTR = A.MTRMANFCTR AND M.COMPANY = A.COMPANY " +
        " LEFT JOIN VAT V ON V.VAT = A.VAT " +
        " LEFT JOIN MTRUNIT U ON U.MTRUNIT = A.MTRUNIT1 AND U.COMPANY = A.COMPANY " +
        dsSqlWhere;



    dsSql = dsSql + dsSqlOrder;//+ " offset 3272 rows "
    // return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY, X.SYS.COMPANY, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    currentPCode = '';
    dsData.FIRST;
    while (!dsData.EOF()) {
        response.data.push({
            "ITEMID": dsData.ITEMID,
            "CODE": dsData.SKU,
            "PRICE": dsData.PRICE,
            "LIANIKI": dsData.LIANIKI,
            // "DISCOUNT": dsData.EKPTOSILIANIKIS,
            "STOCK": dsData.STOCK,
            // "ANAMENOMENA": S1P.FItemOrdered(dsData.ITEMID, '', '')
        });
        dsData.NEXT;
    }

    return response;
}



function getAttributes() {
    // Initialize response array
    var response = initializeResponse(true);

    dsSql = "SELECT CCCCLCHARTYPE AS ATTRIBUTEID,NAME AS DESCRIPTION,ISACTIVE, ESHOPID FROM CCCCLCHARTYPE WHERE COMPANY=" + X.SYS.COMPANY;

    //	SELECT
    //	A.MTRL,
    //	A.CHARTYPE,
    //	CT.NAME,
    //	CT.ESHOPID,
    //	ISNULL( CAST(A.CHAR1VAL AS VARCHAR), ISNULL( CAST(CP.CCCCLCHARVAL AS VARCHAR),0)) as char_val_code,
    //	ISNULL( CAST(C1.NAME AS VARCHAR), ISNULL( CAST(CP.NAME AS VARCHAR),ISNULL(A.CHAR3VAL,''))) as char_val_name
    //	FROM (SELECT  
    //			A.MTRL, 
    //			A.CCCCLCHARVALS AS CHAR1VAL,
    //			A.CCCCLCHARVALM AS CHAR2VAL,
    //			A.CCCCLCHARVALT AS CHAR3VAL,
    //			A.CCCCLCHARTYPE AS CHARTYPE
    //			from CCCCLITEMCHARCTYPE A
    //			) A 
    //LEFT JOIN CCCCLCHARVAL C1 ON A.CHAR1VAL = C1.CCCCLCHARVAL
    //left join CCCCLCHARVAL CP on ',' + CHAR2VAL + ',' LIKE '%,' + CAST(CP.CCCCLCHARVAL AS VARCHAR)+ ',%'
    //LEFT JOIN CCCCLCHARTYPE CT ON A.CHARTYPE = CT.CCCCLCHARTYPE
    //ORDER BY A.MTRL

    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;

    dsData.FIRST;
    while (!dsData.EOF()) {
        response.data.push({
            "ATTRIBUTEID": dsData.ATTRIBUTEID,
            "DESCRIPTION": dsData.DESCRIPTION,
            "ISACTIVE": dsData.ISACTIVE,
            // "ESHOPID": dsData.ESHOPID
        });
        dsData.NEXT;
    }

    return response;
}

function getAttributesValues(obj) {
    // Initialize response array
    //debugger
    //return;
    var response = initializeResponse(true);

    dsSql = "	select distinct q.c1 as typeid, q.c2 as typename, q.c3 as valuename, q.c4 as magentotype from ( " +
        "	select a.CCCCLCHARTYPE as c1, a.name as c2 ,b.name as c3, 0 as c4 from CCCCLCHARTYPE A " +
        "	inner join CCCCLCHARVAL B on a.CCCCLCHARTYPE = b.CCCCLCHARTYPE " +
        "	union all " +
        "	select a.CCCCLCHARTYPE as c1, a.name as c2, c.cccclcharvalt  as c3, 1 as c4 from CCCCLCHARTYPE A " +
        "	inner join CCCCLITEMCHARCTYPE C on a.CCCCLCHARTYPE = c.CCCCLCHARTYPE and cccclcharvalt is not null " +
        "	)q order by q.c1 asc ";

    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;

    dsData.FIRST;
    while (!dsData.EOF()) {
        currenttype = dsData.typeid;
        typeid = dsData.typeid;
        typename = dsData.typename;
        magentotype = dsData.magentotype;
        values = [];

        while ((!dsData.EOF()) && (currenttype == dsData.typeid)) {
            currenttype = dsData.typeid
            values.push(dsData.valuename);
            if (dsData.magentotype == 0)
                magentotype = 0;
            dsData.NEXT;
        }

        response.data.push({
            "typeid": typeid,
            "typename": typename,
            "values": values,
            "magentotype": magentotype
        });
    }

    return response;
}


function getClientDocs(obj) {
    // Initialize response array
    var response = initializeResponse(true);

    // if ((!obj.code) || (obj.code == null)) responseError("No client code");
    // var client_res = getCustomers(obj);
    // if (client_res.totalcount == 1) {
    //     var client_id = client_res.data[0].customer_id
    // } else if (client_res.totalcount > 1) {
    //     return responseError("No client or More than 1 found with " + obj.code);
    // }
    let current_year = new Date().getFullYear();
    if (obj.datefrom) var datefrom = obj.datefrom; else var datefrom = (current_year + '/01/01');
    if (obj.dateto) var dateto = obj.dateto; else var dateto = (current_year + '/12/31');
    if ((obj.series) && (fieldHasValue(obj.series))) var series = obj.series; else var series = "6024, 7024, 8024";

    // Query Filters
    dsSqlWhere = "WHERE A.COMPANY = :1  AND A.SOSOURCE = 1351  AND A.SOREDIR = 0 AND A.SODTYPE = 13  " +
        "AND A.TRNDATE >= '" + datefrom + "' " +
        "AND A.TRNDATE <= '" + dateto + "'  " +
        "AND A.FPRMS IN (" + series + ") ";

    if ((obj.code) && (obj.code != null)) {
        var client_res = getCustomers(obj);
        if (client_res.totalcount == 1) {
            var client_id = client_res.data[0].customer_id
            dsSqlWhere += "AND A.TRDR = " + client_id + " ";
        } else if (client_res.totalcount > 1) {
            return responseError("No client or More than 1 found with " + obj.code);
        }
    }


    dsSql = "SELECT A.FINDOC as id, cast (A.TRNDATE as date)  as docdate,  A.SERIES as series, A.FINCODE as doc, C.CODE AS client_code, C.NAME AS client_name, 	" +
        "M.CODE AS item_code, M.NAME AS tem_title, L.MTRUNIT AS mm_id, L.VAT AS vat_id, L.QTY1 AS qty, L.PRICE AS item_price, L.LINEVAL AS iten_value, " +
        "ISNULL( " +
        " ( " +
        "    SELECT  " +
        "      SUM( " +
        "        CASE WHEN FP.FINPAYTERMS IS NULL THEN AF.SUMTAMNT - ISNULL(EF.SUMTAMNT, 0) ELSE FP.OPNTAMNT END " +
        "      )  " +
        "    FROM  " +
        "      FINDOC AF  " +
        "      LEFT OUTER JOIN FINPAYTERMS FP ON AF.FINDOC = FP.FINDOC " +
        "      LEFT OUTER JOIN FINDOC EF ON EF.FINDOC = AF.FINDOCPAY  " +
        "    WHERE  " +
        "     AF.FINDOC = A.FINDOC " +
        "     AND AF.ISCANCEL = 0 " +
        "     AND AF.ORIGIN <> 6 " +
        "  ),  " +
        "  0 " +
        ") AS total " +
        "FROM  " +
        "( " +
        "  ( " +
        "   ( " +
        "      ( " +
        "       FINDOC A  " +
        "       LEFT OUTER JOIN MTRDOC B ON A.FINDOC = B.FINDOC " +
        "       LEFT OUTER JOIN MTRLINES L ON A.FINDOC = L.FINDOC " +
        "       INNER JOIN MTRL M ON L.MTRL = M.MTRL " +
        "     ) " +
        "     LEFT OUTER JOIN TRDR C ON A.TRDR = C.TRDR " +
        "   ) " +
        "    LEFT OUTER JOIN TRDEXTRA D ON A.TRDR = D.TRDR " +
        "  )  " +
        "  LEFT OUTER JOIN PRSN E ON A.SALESMAN = E.PRSN " +
        ")  " +
        "LEFT OUTER JOIN PRSN F ON A.SALESMAN = F.PRSN  ";

    // Query Order
    dsSqlOrder = " ORDER BY A.TRNDATE DESC,A.FINDOC ";

    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    //return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    // response.totalcount = dsData.RECORDCOUNT;
    // response.data = JSON.parse(dsData.JSON);
    debugger;
    response.totalcount = dsData.RECORDCOUNT;
    count_rec = 0;
    dsData.FIRST;
    while (!dsData.EOF()) {
        id = dsData.id;
        // docdate = dsData.docdate;
        docdate = X.FORMATDATE("YYYY-MM-DD", dsData.docdate);
        series = dsData.series;
        currentdoc = dsData.doc;
        client_code = dsData.client_code;
        client_name = dsData.client_name;
        values = [];

        while ((!dsData.EOF()) && (currentdoc == dsData.doc)) {
            currentdoc = dsData.doc;
            values.push({
                "item_code": dsData.item_code,
                "tem_title": dsData.tem_title,
                "qty": dsData.qty,
                "item_price": dsData.item_price,
                "iten_value": dsData.iten_value
            });
            dsData.NEXT;
        }
        count_rec++;
        response.data.push({
            "id": id,
            "series": series,
            "docdate": docdate,
            "doc": currentdoc,
            "client_code": client_code,
            "client_name": client_name,
            "items": values
        });

    }

    response.totalcount = count_rec;
    return response;
}


function getOrderDetails(obj) {
    // Initialize response array
    var response = initializeResponse(true);

    // if ((!obj.code) || (obj.code == null)) responseError("No client code");
    // var client_res = getCustomers(obj);
    // if (client_res.totalcount == 1) {
    //     var client_id = client_res.data[0].customer_id
    // } else if (client_res.totalcount > 1) {
    //     return responseError("No client or More than 1 found with " + obj.code);
    // }
    let current_year = new Date().getFullYear();
    if (obj.datefrom) var datefrom = obj.datefrom; else var datefrom = (current_year + '/01/01');
    if (obj.dateto) var dateto = obj.dateto; else var dateto = (current_year + '/12/31');

    // Query Filters
    dsSqlWhere = "WHERE A.COMPANY = :1  AND A.SOSOURCE = 1351  AND A.SOREDIR = 0 AND A.SODTYPE = 13  " +
        "AND A.TRNDATE >= '" + datefrom + "' " +
        "AND A.TRNDATE <= '" + dateto + "'  ";
    if ((obj.series) && (fieldHasValue(obj.series))) dsSqlWhere += "AND A.FPRMS IN (" + obj.series + ") ";

    if ((obj.code) && (obj.code != null)) {
        var client_res = getCustomers(obj);
        if (client_res.totalcount == 1) {
            var client_id = client_res.data[0].customer_id
            dsSqlWhere += "AND A.TRDR = " + client_id + " ";
        } else if (client_res.totalcount > 1) {
            return responseError("No client or More than 1 found with " + obj.code);
        }
    }

    if (obj.webid)
        dsSqlWhere += "AND A.FINCODE = '" + obj.webid + "' ";

    dsSql = "SELECT A.FINDOC AS id, A.TRNDATE, A.SERIES, A.FINCODE, A.PAYMENT, A.SHIPMENT, A.REMARKS, A.COMMENTS , CASE WHEN C.TRDCATEGORY = 399 THEN 0 ELSE 1 END  AS invoice " +
        "FROM FINDOC A " +
        "inner join TRDR C on C.TRDR = A.TRDR ";

    // Query Order
    dsSqlOrder = " ORDER BY A.TRNDATE DESC,A.FINDOC ";

    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    //return dsSql;
    dsDataOrder = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    // response.totalcount = dsDataOrder.RECORDCOUNT;
    // response.data = JSON.parse(dsDataOrder.JSON);
    debugger;
    response.totalcount = dsDataOrder.RECORDCOUNT;
    dsDataOrder.FIRST;
    while (!dsDataOrder.EOF()) {
        id = dsDataOrder.id;
        webid = dsDataOrder.FINCODE;
        docdate = X.FORMATDATE("YYYY-MM-DD", dsDataOrder.TRNDATE);

        bilingInfo = getOrderBilingInfo(webid);
        if (!bilingInfo.success) bilingInfodata = "{}"; else bilingInfodata = bilingInfo.data[0]

        shipinfo = getOrderShipinfo(webid);
        if (!shipinfo.success) shipinfodata = "{}"; else shipinfodata = shipinfo.data[0];

        orderItems = getOrderItems(id);
        if (!orderItems.success) orderItems = []; else orderItems = orderItems.data;
        orderExp = getOrderExp(id);
        if (!orderExp.success) orderExp = []; else orderExp = orderExp.data;

        response.data.push({
            "id": id,
            "date": docdate,
            "webid": webid,
            "series": dsDataOrder.SERIES,
            "payment": dsDataOrder.PAYMENT,
            "shipment": dsDataOrder.SHIPMENT,
            "remarks": dsDataOrder.REMARKS,
            "comments": dsDataOrder.COMMENTS,
            "invoice": dsDataOrder.invoice,
            "billinfo": bilingInfodata,
            "shipinfo": shipinfodata,
            "items": orderItems,
            "expanal": orderExp
        });
        dsDataOrder.NEXT;
    }

    // response.totalcount = count_rec;
    return response;
}


function getTrackingNo(obj) {
    // Initialize response array
    debugger;
    var response = initializeResponse(true);

    if ((!obj.id) || (obj.id == null)) responseError("No erp id");

    // Query Filters
    dsSqlWhere = "WHERE A.COMPANY = :1  AND A.SOSOURCE = 1351  AND A.SOREDIR = 0 AND A.SODTYPE = 13  " +
        "AND A.FINDOC = '" + obj.id + "' ";
    dsSql = "SELECT A.FINDOC AS id,  A.TRNDATE, A.CCCVoucherNo,  A.CCCCLVOUCHER, A.CCCCLVOUCHERSEXTRA , A.SHIPMENT as SHIPMENTID, S.NAME as SHIPMENT " +
        "FROM FINDOC A " +
        "LEFT JOIN SHIPMENT S ON S.SHIPMENT = A.SHIPMENT AND A.COMPANY = S.COMPANY ";
    // Query Order
    dsSqlOrder = " ORDER BY A.TRNDATE DESC,A.FINDOC ";

    dsSql = dsSql + dsSqlWhere + dsSqlOrder;
    //return dsSql;
    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);
    response.totalcount = dsData.RECORDCOUNT;
    dsData.FIRST;
    while (!dsData.EOF()) {
        id = dsData.id;
        docdate = X.FORMATDATE("YYYY-MM-DD", dsData.TRNDATE);
        response.data.push({
            "id": id,
            "date": docdate,
            "voucher": dsData.CCCCLVOUCHER,
            "voucherextra": dsData.CCCCLVOUCHERSEXTRA,
            "shipmentid": dsData.SHIPMENTID,
            "shipment": dsData.SHIPMENT
        });
        dsData.NEXT;
    }

    // response.totalcount = count_rec;
    return response;
}

function checkSupplierName(name) {
    // Initialize response array
    var response = initializeResponse(true);
    dsSql = " SELECT top 1 ISNULL(UTBL03,0) AS ID FROM UTBL03 WHERE NAME = '" + name + "'" +
        " AND COMPANY = " + X.SYS.COMPANY + " AND SODTYPE = 51";


    dsData = X.GETSQLDATASET(dsSql, X.SYS.COMPANY);

    response.totalcount = dsData.RECORDCOUNT;
    dsData.FIRST;
    rows = [];

    return dsData.ID;
}