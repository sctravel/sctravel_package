/**
 * Created by XiTU on 5/29/14.
 */
var constants = require('./constants');
var tableNames = require('./tableNames');
var dbPool = require('./createDBConnectionPool');
var stringUtils = require('./stringUtils');
var runQuery = dbPool.runQuery;
var runQueryWithParams = dbPool.runQueryWithParams;




/*********************************************************************
 * Customer /Admin Tools Functionality
 *  Search for Vouchers based on different criteria
 *******************************************************************/

var searchVoucherSQL =  "select voucher.voucher_id as  id, o.order_id, o.confirmation_code , o.total_order_amount, o.order_status, " +
    " voucher.offer_subtotal_amount, customer.customer_id, customer.customer_name, customer.mobile_phone, customer.email, " +
    " offer.offer_id,route.to_label, route.route_id, depart.spot_id as depart_spot_id, depart.spot_name as depart_spot_name, " +
    " arr.spot_id as arrival_spot_id, arr.spot_name as arrival_spot_name, voucher.valid_date, schedule.departure_time, " +
    " offer.offer_name,voucher.quantity, voucher.voucher_description as description " +
    " from " + tableNames.orderTable + " o inner join " + tableNames.voucherTable +" voucher on " +
    " o.order_id = voucher.order_id inner join " + tableNames.customerTable + " customer on o.customer_id=customer.customer_id" +
    " inner join " + tableNames.offerTable+ " offer on voucher.offer_id = offer.offer_id inner join " + tableNames.mappingTable +
    " mapping on mapping.offer_id = offer.offer_id inner join "+ tableNames.routeTable + " route " +
    " on mapping.sku_id = route.route_id inner join " + tableNames.scheduleTable +" schedule on voucher.schedule_id=schedule.schedule_id " +
    " inner join " + tableNames.spotTable + " depart on route.departure_spot_id = depart.spot_id inner join "+ tableNames.spotTable +" arr on " +
    " route.arrival_spot_id=arr.spot_id where voucher.valid_date >= CURRENT_DATE()-365 "; //only look for valid vouchers


exports.getVouchersFromCustomerInfo = function(userInfo, callback) {

    var sql = searchVoucherSQL + " and customer.customer_name=? and customer.mobile_phone= ? " ;

    runQueryWithParams(sql,[userInfo.customerName, userInfo.mobilePhone],function(err,results) {
        if(err) {
            throw err;
        }
        console.dir(results);
        callback(results);
    });
}

exports.getVouchersFromOrderId = function(orderId, callback) {
    var sql = searchVoucherSQL + " and o.order_Id = ? " ;

    runQueryWithParams(sql,[orderId],function(err,results) {
        if(err) {
            throw err;
        }
        console.dir(results);
        callback(results);
    });}

exports.getVouchersFromConfirmationCode = function(confirmCode, callback) {
    var sql = searchVoucherSQL + " and o.confirmation_code= ? ";

    runQueryWithParams(sql,[confirmCode], function(err,results){
        if(err) {
            throw err;
        }
        console.dir(results);
        callback(results);
    })

}
