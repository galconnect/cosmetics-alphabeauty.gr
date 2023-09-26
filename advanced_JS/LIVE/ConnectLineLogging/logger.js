//// ConnectLineLogging.logger
//// ConnectLineLogging.logger
var defaultMinSeverity = 1;  //Trace - 1, Debug - 2, Info - 3, Warn - 4, Error - 5, Fatal - 6 


function LogTrace(module, logConfig) {
    if (logConfig.minSeverity <= 1) LogMessage(logConfig.module + "." + module, 1, logConfig);
}

function LogDebug(module, logConfig) {
    if (logConfig.minSeverity <= 2) LogMessage(logConfig.module + "." + module, 2, logConfig);
}

function LogInfo(module, logConfig) {
    if (logConfig.minSeverity <= 3) LogMessage(logConfig.module + "." + module, 3, logConfig);
}

function LogWarn(module, logConfig) {
    if (logConfig.minSeverity <= 4) LogMessage(logConfig.module + "." + module, 4, logConfig);
}

function LogError(module, logConfig) {
    if (logConfig.minSeverity <= 5) LogMessage(logConfig.module + "." + module, 5, logConfig);
}

function LogFatal(module, logConfig) {
    if (logConfig.minSeverity <= 6) LogMessage(logConfig.module + "." + module, 6, logConfig);
}

function getComputerName() {
    // Returns: The PC name if found, otherwise 'Unknown'.
    try {
        var network = new ActiveXObject('WScript.Network');
        return network.computerName;
    }
    catch (e) {
        return "Unknown";
    }
}

function LogMessage(module, minSeverity, logConfig) {
    logConfig.message = logConfig.message.replace(/\'/g, "' + char(39) + '");

    if (logConfig.message.length > 8000) {
        logConfig.message = logConfig.message.substring(0, 7998);
    }

    var sqlInsert = "insert into CCCCLLOGGING (COMPANY,MODULE,PCNAME,LOGUSER,LOGDATE,LOGSEVERITY,LOGMESSAGE) " +
        "values (" + X.SYS.COMPANY + ", '" + module + "', '" + getComputerName() + "', " + X.SYS.USER + ", getdate(), " + minSeverity + ", '" + logConfig.message + "')";

    X.RUNSQL(sqlInsert, null);
}

function ClearLog(module, deldays) {
    if (deldays > 0)
        X.RUNSQL("DELETE FROM CCCCLLOGGING WHERE DATEDIFF(DAY,LOGDATE,GETDATE()) > " + deldays + " AND MODULE LIKE '" + module + "%'", null);
}