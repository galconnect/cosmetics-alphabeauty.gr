//// ConnectLineB2BConnector.logger
var defaultMinSeverity = 1;  //Trace - 1, Debug - 2, Info - 3, Warn - 4, Error - 5, Fatal - 6 

function LogTrace(module, message) {
    if (defaultMinSeverity <= 1) LogMessage(module, 1, message);
}

function LogTrace(module, message, logConfig) {
    if (logConfig.minSeverity <= 1) LogMessage(logConfig.module + "." + module, 1, message);
}

function LogDebug(module, message) {
    if (defaultMinSeverity <= 2) LogMessage(module, 2, message);
}

function LogDebug(module, message, logConfig) {
    if (logConfig.minSeverity <= 2) LogMessage(logConfig.module + "." + module, 2, message);
}

function LogInfo(module, message) {
    if (defaultMinSeverity <= 3) LogMessage(module, 3, message);
}

function LogInfo(module, message, logConfig) {
    if (logConfig.minSeverity <= 3) LogMessage(logConfig.module + "." + module, 3, message);
}

function LogWarn(module, message) {
    if (defaultMinSeverity <= 4) LogMessage(module, 4, message);
}

function LogWarn(module, message, logConfig) {
    if (logConfig.minSeverity <= 4) LogMessage(logConfig.module + "." + module, 4, message);
}

function LogError(module, message) {
    if (defaultMinSeverity <= 5) LogMessage(module, 5, message);
}

function LogError(module, message, logConfig) {
    if (logConfig.minSeverity <= 5) LogMessage(logConfig.module + "." + module, 5, message);
}

function LogFatal(module, message) {
    if (defaultMinSeverity <= 6) LogMessage(module, 6, message);
}

function LogFatal(module, message, logConfig) {
    if (logConfig.minSeverity <= 6) LogMessage(logConfig.module + "." + module, 6, message);
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

function LogMessage(module, severity, message) {
    message = message.replace(/\'/g, "' + char(39) + '");
    //message = message.replace(/\:/g, "' + char(58) + '");

    if (message.length > 8000) {
        message = message.substring(0, 7998);
    }

    var sqlInsert = "insert into CCCCLLOGGING (COMPANY,MODULE,PCNAME,LOGUSER,LOGDATE,LOGSEVERITY,LOGMESSAGE) " +
        "values (" + X.SYS.COMPANY + ", '" + module + "', '" + getComputerName() + "', " + X.SYS.USER + ", getdate(), " + severity + ", '" + message + "')";

    X.RUNSQL(sqlInsert, null);
}

function ClearLog(module, deldays) {
    if (deldays > 0)
        X.RUNSQL("DELETE FROM CCCCLLOGGING WHERE DATEDIFF(DAY,LOGDATE,GETDATE()) > " + deldays + " AND MODULE LIKE '" + module + "%'", null);
}