/**
 * Created by XiTU on 5/29/14.
 */

var dbPool = require('./createDBConnectionPool');
var constants = require('./constants');
var tableNames = require('./tableNames');
var runQuery = dbPool.runQuery;
var runQueryWithParams = dbPool.runQueryWithParams;
var clientQueryDB = require('./clientQueryDB');
/***************************************
 /* Admin functionalities
 /***************************************/

//Need to refresh the cache for client every time we do a DB update operation

//Insert a record to a table, enable/disable existing records
function insertRecord(tableName,tableColumnNames, values, callback) {
    var insertSql = 'Insert into ' + tableName +
        ' ( ' + stringUtils.getDelimitedStringFromArray(tableColumnNames,',') +' ) VALUES ( ' +
        stringUtils.getDelimitedRepeatString('?',',',tableColumnNames.length) + ' ) ' ;

    runQueryWithParams( insertSql, values, function(err,results){
        if(err) {
            console.error("Error in insertRecord to "+tableName+";"+err);
            callback(err,null);
            return;
        }
        callback(null,results);
    });
}

exports.disableRecord = function(tableName, tableKeyName, key, callback) {
    var updateSql = "update "+tableName +" set is_active = 'N' where "+tableKeyName+ " = ? and is_active='Y' ";

    runQueryWithParams(updateSql,[key],function(err,results){
        if(err) {
            console.error("Error in disableRecord of "+tableName+";"+err);
            callback(err,null);
            return;
        }
        callback(null,results);
    })
}

exports.enableRecord = function(tableName, tableKeyName, key, callback) {
    var updateSql = "update "+tableName +" set is_active = 'Y' where "+tableKeyName+ " = ? and is_active='N' ";

    runQueryWithParams(updateSql,[key],function(err,results){
        if(err) {
            console.error("Error in enableRecord of "+tableName+";"+err);
            callback(err,null);
            return;
        }
        callback(null,results);
    })
}



exports.addScenerySpot = function(tableColumnNames,values,callback){
    insertRecord(tableNames.spotTable, tableColumnNames ,values,callback);

    clientQueryDB.loadDataFromDBToCache(tableNames.spotTable,"getAllScenerySpots",whereClause, tableNames.spotTableKey,callback);
    clientQueryDB.loadDataFromDBToCache(tableNames.spotTable,"getAllStartSpots",whereClause,tableNames.spotTableKey,callback);
}

//Once we disable one scenery spot,
// we need to disable all the routes/offer assocate with the spot
exports.disableScenerySpot = function( key, callback) {
    disableRecord(tableNames.spotTable, tableNames.spotTableKey, key, callback);

    //Refresh Cache for main page
    clientQueryDB.loadDataFromDBToCache(tableNames.spotTable,"getAllScenerySpots",whereClause, tableNames.spotTableKey,callback);
    clientQueryDB.loadDataFromDBToCache(tableNames.spotTable,"getAllStartSpots",whereClause,tableNames.spotTableKey,callback);

    //get all the routes associate with the spot and disable them

    //get all the offers associate with the route and disable them


}

exports.enableScenerySpot = function( key, callback) {
    enableRecord(tableNames.spotTable, tableNames.spotTableKey, key, callback);
}


exports.addRoute = function(tableColumnNames,values,callback) {
    insertRecord(tableNames.routeTable, tableColumnNames,values,callback);
}
//Once we disable one route,
// we need to disable all the offers assocate with the route
exports.disableRoute = function(key,callback) {
    disableRecord(tableNames.routeTable,tableNames.routeTableKey, key, callback);

    //get all the offers associate with the route and disable them

}
exports.enableRoute = function(key,callback) {
    enableRecord(tableNames.routeTable, tableNames.routeTableKey, key, callback);
}

