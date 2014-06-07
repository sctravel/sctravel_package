/**
 * Created by XiTU on 5/21/14.
 */
var constants = require('./constants');
var tableNames = require('./tableNames');
var queryDB = require('./queryDB');
var verifyUser = require('./adminLogin').verifyUser;
var dbPool = require('./createDBConnectionPool');
var runQuery = dbPool.runQuery;
var runQueryWithParams = dbPool.runQueryWithParams;
//TODO check the tool permission Id for this adminuser to see whether he has permission or not
exports.adminPlaceOrder = function(userInfo, orderInfo, adminUsername, randomKey, callback) {
    verifyUser(adminUsername,randomKey, function(err, results) {
        if(err) {
            console.error(err);
            callback(err,null);
            return;
        }

        if(results && results == "done") {
            console.dir(userInfo);
            console.dir(orderInfo);
            queryDB.placeOrder(userInfo,orderInfo,adminUsername,function(err,results){
                if(err) {
                    console.error(err);
                    callback(err,null);
                    return;
                }

                callback(null,results);
            })
        } else {
            calback(new Error("unknown error in adminPlaceOrder"),null);
        }
    });
}

exports.adminCancelOrder = function(orderId, adminUsername, randomKey, callback) {
    verifyUser(adminUsername,randomKey, function(err, results) {
        if(err) {
            console.error(err);
            callback(err,null);
            return;
        }

        if(results && results == "done") {
            queryDB.changeOrderStatus(orderId,constants.ORDER_STATUS.CANCELLED,0,adminUsername,function(err,results){
                if(err) {
                    callback(err,null);
                    return;
                }
                console.info("Amdin user: "+adminUsername+ " successfully cancelled order:"+orderId);
                callback(null,results);
            })
        } else {
            calback(new Error("unknown error in adminPlaceOrder"),null);
        }
    });
}

//look up by phone number
exports.getOrderFromCustomersPhoneNumber = function(CustomersFromPhoneNumber,callback) {

    // var sql = "select * from sc_customers where mobile_phone =?";

    var sql = "select C.customer_name,C.mobile_phone,C.email,O.order_id,O.order_datetime,O.customer_id,O.total_order_amount,O.confirmation_code,O.order_status," +
        "O.description,O.created_by,O.creation_datetime,O.last_updated_time" +
        " from sc_customers as C inner " +
        "join sc_orders as O where C.customer_id = O.customer_id and C.mobile_phone =?";

    runQueryWithParams(sql,[CustomersFromPhoneNumber],function(err,results) {
        if(err) {
            throw err;
        }
        console.dir(results);
        callback(results);
    });

}

//Search orders by customerName/phone/orderId/ConfirmationNumber

//look up by name(done)
exports.geOrdersFromCustomerName = function(CustomersFromName,callback) {

    //var sql = "select * from sc_customers where customer_name =?";

    var sql = "select C.customer_name,C.mobile_phone,C.email,O.order_id,O.order_datetime,O.customer_id,O.total_order_amount,O.confirmation_code,O.order_status," +
        "O.description,O.created_by,O.creation_datetime,O.last_updated_time" +
        " from sc_customers as C inner " +
        "join sc_orders as O where C.customer_id = O.customer_id and C.customer_name =?";


    runQueryWithParams(sql,[CustomersFromName],function(err,results) {
        if(err) {
            throw err;
        }
        console.dir(results);
        callback(results);
    });

}

//look up by confirmation number
exports.getOrderFromCustomersConfirmationNumber = function(confirmNum,callback) {

    // C.customer_id,C.customer_name,C.mobile_phone,C.email,C.is_registered
    var sql = "select C.customer_name,C.mobile_phone,C.email,O.order_id,O.order_datetime,O.customer_id,O.total_order_amount,O.confirmation_code,O.order_status," +
        "O.description,O.created_by,O.creation_datetime,O.last_updated_time" +
        " from sc_customers as C inner " +
        "join sc_orders as O where C.customer_id = O.customer_id and  O.confirmation_code=?";

    runQueryWithParams(sql,[confirmNum],function(err,results) {
        if(err) {
            throw err;
        }
        console.dir(results);
        callback(results);
    });

}

//lookup by ticket number
exports.getCustomersFromTicketNumber = function(ticketNum,callback) {

    var sql = "select C.customer_id,C.customer_name,C.mobile_phone,C.email,C.is_registered from sc_customers as C inner " +
        "join sc_orders as O on C.customer_id = O.customer_id inner join sc_order_vouchers as V on V.order_id = O.order_id and V.voucher_id=?";

    runQueryWithParams(sql,[ticketNum],function(err,results) {
        if(err) {
            throw err;
        }
        console.dir(results);
        callback(results);
    });

}


//lookup by order number(done)
exports.getOrderFromOrderNumber = function(CustomersOrderId,callback) {

    //var sql = "select C.customer_id,C.customer_name,C.mobile_phone,C.email,C.is_registered from sc_customers as C inner join sc_orders as O where C.customer_id = O.customer_id and  O.customer_id=?";

    var sql = "select C.customer_name,C.mobile_phone,C.email,O.order_id,O.order_datetime,O.customer_id,O.total_order_amount,O.confirmation_code,O.order_status," +
        "O.description,O.created_by,O.creation_datetime,O.last_updated_time" +
        " from sc_customers as C inner " +
        "join sc_orders as O where C.customer_id = O.customer_id and  O.order_id=?";

    runQueryWithParams(sql,[CustomersOrderId],function(err,results) {
        if(err) {
            throw err;
        }
        console.dir(results);
        callback(results);
    });

}