/**
 * Created by XiTU on 5/29/14.
 */

// declare and define all the variables used in the module
var constants = require('./constants');
var tableNames = require('./tableNames');
var dbPool = require('./createDBConnectionPool');
var cache = require('memory-cache');
var stringUtils = require('./stringUtils');
var runQuery = dbPool.runQuery;
var runQueryWithParams = dbPool.runQueryWithParams;


var timeoutInMilliSeconds = 1000*60*60*24;  //Cache timeout in 1 day


/****************************************************
 * Common utility for getAll functions
 * return all the requested data in json format.
 * Searching in Cache first, with key @tableName
 *  if key doesn't exist, query from DB, and
 *   then put the key/value pair into Cache
 * @param tableName
 *     the table name which we need to extract from
 * @param callback
 *     callback function to process the results
 ****************************************************/
function getAllFromCacheOrDB(tableName,cacheKey,whereClause,keyName,callback) {
    var data = cache.get(cacheKey);
    //First get the data from cache,
    //if there's no data in cache, query from DB and then put it into cache.
    if(data) {
        console.info("Cache hits, getting " +cacheKey+ " from Cache.");
        callback(data);
    } else {
        loadDataFromDBToCache(tableName,cacheKey,whereClause,keyName,callback);
    }
}

function loadDataFromDBToCache(tableName,cacheKey,whereClause,keyName,callback) {
    var sql = " select * from "+tableName+" "+whereClause;
    runQuery(sql,function(err,results){
        if(err) {
            throw err;
        }
        var allData={};
        //format the results with search key "keyName"
        for(var i in results) {
            var result=results[i];
            //console.log(result);
            allData[result[keyName]]=result;
        }
        console.log("Cache missing, querying "+cacheKey+" from DB.");
        cache.put(cacheKey,allData,timeoutInMilliSeconds);
        callback(allData);
    });
}
 exports.loadDataFromDBToCache = loadDataFromDBToCache;

/**********************************************
 * getAll% methods
 * @param callback
 *     callback function to process the results
 **********************************************/
exports.getAllScenerySpots = function(callback) {
    var whereClause = " where is_active='Y' ";
    getAllFromCacheOrDB(tableNames.spotTable,"getAllScenerySpots",whereClause, tableNames.spotTableKey,callback);
}

exports.getAllRoutes = function(callback) {

    var whereClause = " where is_active='Y' ";
    getAllFromCacheOrDB(tableNames.routeTable,"getAllRoutes",whereClause, tableNames.routeTableKey,callback);
}

exports.getAllBuses = function(callback) {
    var whereClause = " where is_active='Y' ";
    getAllFromCacheOrDB(tableNames.busTable,"getAllBuses",whereClause,tableNames.busTableKey,callback);
}

exports.getAllDrivers = function(callback) {
    var whereClause = " where is_active='Y' ";
    getAllFromCacheOrDB(tableNames.driverTable,"getAllDrivers",whereClause,tableNames.driverTableKey,callback);
}

//all schedules with date null or later than today
exports.getAllValidSchedules = function(callback) {

    var whereClause = " where schedule_date is null or schedule_date >= now()";
    //Group the schedule results by routeId
    getAllFromCacheOrDB(tableNames.scheduleTable,"getAllValidSchedules",whereClause,tableNames.scheduleTableKey, function(results){

        var scheduleByRouteId={};

        for(var i in results) {
            var result = results[i];
            var routeId= result.route_id;
            var scheduleArray = scheduleByRouteId[routeId];
            if(!scheduleArray) {
                scheduleArray=[];
                scheduleByRouteId[routeId]=scheduleArray;
            }
            scheduleArray.push(result);
        }
        callback(scheduleByRouteId);
    });

}

exports.getAllStartSpots = function(callback) {

    var whereClause = " where is_start='Y' and is_active='Y' ";
    getAllFromCacheOrDB(tableNames.spotTable,"getAllStartSpots",whereClause,tableNames.spotTableKey,callback);

}

exports.getRoutesFromStartSpots = function(callback) {

    var cacheKey = "getRoutesFromStartSpots";
    var data = cache.get(cacheKey);

    if(data) {
        console.log("cache hits, get "+cacheKey +" from cache");
        callback(data);
    } else {
        //getAllFromCacheOrDB(tableNames.routeTable,"", tableNames.routeTableKey, function(results){
        var sql = " select distinct route_id,departure_spot_id,arrival_spot_id, to_label, is_round_trip, distance, travel_time_in_minutes," +
            " duration_in_minutes, route_description,base_price from " + tableNames.routeTable + " rt inner join "+ tableNames.mappingTable +
            " mt on rt.route_id=mt.sku_id where rt.is_active='Y'";

        runQuery(sql,function(err,results) {
            if(err) {
                throw err;
            }
            console.log(results);
            var routesByDepartureId={};

            for(var i in results) {
                var result = results[i];
                var departureId = result.departure_spot_id;
                console.log("departureId-"+departureId);
                var routesArray = routesByDepartureId[departureId];
                if(!routesArray){
                    routesArray=[];
                    routesByDepartureId[departureId]=routesArray;
                }
                routesArray.push(result);
                //console.log("routesArray-"+routesArray);
            }
            cache.put(cacheKey,routesByDepartureId,timeoutInMilliSeconds);
            callback(routesByDepartureId);
        });
    }
}

exports.getOffersFromRouteId = function(callback) {

    var cacheKey="getOffersFromRouteId";

    var data = cache.get(cacheKey);
    if(data) {
        console.log("cache hits, get "+ cacheKey+" from cache!");
        callback(data);
    } else {

        var sql = " select mt.sku_id as route_id, ot.offer_id, ot.offer_name, ot.offer_price from " + tableNames.mappingTable +" mt inner join " +
            tableNames.offerTable+ " ot on mt.offer_id=ot.offer_id where mt.sku_type = 'R' and ot.is_active='Y' ";

        runQuery(sql, function(err, results) {
            if(err) {
                throw err;
            }
            var offersByRouteId={};

            for(var i in results) {
                var result = results[i];
                var routeId = result.route_id;
                var offerArray = offersByRouteId[routeId];
                if(!offerArray) {
                    offerArray=[];
                    offersByRouteId[routeId]=offerArray;
                }
                offerArray.push(result);
            }
            console.log("cache misses, get "+ cacheKey+" from DB!");

            cache.put(cacheKey,offersByRouteId,timeoutInMilliSeconds);
            callback(offersByRouteId);
        });
    }
}

//What's the final format of offers?
//currently offers are consist of ticketOffers and routeOffers
exports.getAllOffers = function(callback) {

    getAllFromCacheOrDB(tableNames.offerTable,"getAllOffers","",tableNames.offerTableKey,callback);

}

exports.getAllCustomers = function(callback){
    getAllFromCacheOrDB(tableNames.customerTable,"getAllCustomers","",tableNames.customerTableKey,callback);

}