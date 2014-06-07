/**
 * Created by XiTU on 1/27/14.
 */

var fs=require('fs');
var readline=require('readline');
var constants = require('./constants');
//var assert = require('assert');
var dbPool = require('./createDBConnectionPool');
var stringUtils = require('./stringUtils');
var tableNames = require('./tableNames');


//connection.query('CREATE database sctravel');
//connection.query('USE sctravel');


/**********************************************
 *
 * Read data from txt files
 *  according to the format given by params
 * Load the data read from file to
 *  our @tableName table in our DB
 *
 * @param tableColumnNames
 * @param tableColumnTypes
 * @param filePath
 * @param delimiter
 * @param tableName
 *
 *********************************************/
var loadDataFromTxtToTable = function( tableColumnNames, tableColumnTypes, filePath, delimiter, tableName) {

    var connection = dbPool.connection;
    //check the length of tableColumnNames and table ColumnTypes
    if(tableColumnNames.length != tableColumnTypes.length) {
        throw new Error("The length for " + tableName + " of tableColumnNames is "+ tableColumnNames.length+"; and the length of " +
            " tableColumnTypes is "+ tableColumnTypes.length+". They should be equal!");
    }


    console.log("splitting line by "+delimiter);

    var rd = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        terminal: false
    });


    var processline = function(line) {

        var userInput = line.split(delimiter);

        //Convert the types from String to Number if necessary
        for(var i in tableColumnTypes) {

            var type = tableColumnTypes[i];
            if(type==constants.TYPE_NUMBER) {
                userInput[i] = Number(userInput[i]);
            } else if(type==constants.TYPE_STRING) {
                if(userInput[i]) {
                    userInput[i]=userInput[i].trim();
                }
            } else if(type==constants.TYPE_DATE) {
                if(!userInput[i] || userInput[i]=='') {
                    userInput[i]=null;
                }
            }
        }

        //console.log(userInput);
        var insertSql = 'Insert into ' + tableName +
            ' ( ' + stringUtils.getDelimitedStringFromArray(tableColumnNames,',') +' ) VALUES ( ' +
                    stringUtils.getDelimitedRepeatString('?',',',tableColumnNames.length) + ' ) ' ;
        //console.log(insertSql);
        //we can get the automated insertId here in the results
        connection.query( insertSql, userInput,function(err,results){
            //console.dir(results)
        });
    }

    rd.on('line', function(line) {
        processline(line);
        console.log(line);
    });

    rd.on('close',function(){
       // connection.end();
    })


}


/***********************
 *
 * Loading data from txt
 *  file to our DB
 *
 * @type {string}
 **********************/

var spotsFilePath = '../data/scenery_spots.dat';
var spotsColumnNames=['spot_id','spot_name','spot_type','longitude','latitude','city',  'address','post_code','phone', 'hours','is_scenery','is_start'];
var spotsColumnTypes=['NUMBER',   'STRING',  'STRING',  'NUMBER',   'NUMBER',  'STRING','STRING', 'STRING',   'STRING','STRING', 'STRING',  'STRING'];
//load data to sc_scenery_spots
loadDataFromTxtToTable(spotsColumnNames,spotsColumnTypes,spotsFilePath,',', tableNames.spotTable);

var routesFilePath = '../data/routes.dat';
var routesColumnNames=['route_id', 'departure_spot_id', 'arrival_spot_id', 'to_label', 'distance', 'route_description', 'duration_in_minutes', 'travel_time_in_minutes', 'base_price'];
var routesColumnTypes=['NUMBER','NUMBER','NUMBER','STRING','NUMBER','STRING','NUMBER','NUMBER','NUMBER'];
//load data to sc_sku_routes
loadDataFromTxtToTable(routesColumnNames,routesColumnTypes,routesFilePath,',', tableNames.routeTable);


var offersFilePath = '../data/offers.dat';
var offersColumnNames= ['offer_id', 'offer_name','offer_price','offer_description', 'is_round_trip'];
var offersColumnTypes= ['NUMBER','STRING','NUMBER','STRING','STRING'];
//load data to sc_offers
loadDataFromTxtToTable(offersColumnNames,offersColumnTypes,offersFilePath,',', tableNames.offerTable);


var offerSKUMappingFilePath = '../data/offer_sku_mappings.dat';
var offerSKUMappingColumnNames = ['offer_id','sku_id','sku_type', 'category', 'sequence'];
var offerSKUMappingColumnTypes = ['NUMBER','NUMBER','STRING','STRING','NUMBER'];
//load data to sc_sku_offer_mappings
loadDataFromTxtToTable(offerSKUMappingColumnNames,offerSKUMappingColumnTypes,offerSKUMappingFilePath,',',tableNames.mappingTable);

var busesFilePath = '../data/buses.dat';
var busesColumnNames = ['license_plate', 'capacity','bus_brand', 'bus_start_year','bus_type', 'in_service'];
var busesColumnTypes = ['STRING','NUMBER', 'STRING', 'STRING', 'STRING', 'STRING'];
//load data to sc_bus_info
loadDataFromTxtToTable(busesColumnNames,busesColumnTypes,busesFilePath,',',tableNames.busTable);

var driverFilePath = '../data/driver.dat';
var driverColumnNames = ['driver_name','driver_phone','driver_sex','driver_age'];
var driverColumnTypes = ['STRING','STRING','STRING', 'NUMBER'];
//load data to sc_driver_info
loadDataFromTxtToTable(driverColumnNames,driverColumnTypes,driverFilePath,',',tableNames.driverTable);


var busSchedulePath = '../data/bus_schedule.dat';
var busScheduleColumnNames = ['route_id','departure_time','capacity', 'schedule_date','bus_id','driver_id'];
var busScheduleColumnTypes = ['NUMBER','STRING','NUMBER','DATE', 'NUMBER', 'NUMBER'];
//load data to sc_bus_schedules
loadDataFromTxtToTable(busScheduleColumnNames,busScheduleColumnTypes,busSchedulePath,',',tableNames.scheduleTable);

//rd.close();
//name, type, content, image, web_url, latitude, longtitude, city, address, phone, hours



