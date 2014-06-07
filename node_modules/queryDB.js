/**
 * Created by XiTU on 1/28/14.
 */

// declare and define all the variables used in the module

var async = require('async');
var cache = require('memory-cache');
var stringUtils = require('./stringUtils');
var mail=require('./emailUtil');
var dbPool = require('./createDBConnectionPool');
var constants = require('./constants');
var tableNames = require('./tableNames');
var runQuery = dbPool.runQuery;
var runQueryWithParams = dbPool.runQueryWithParams;


/*****************************************************
 * Place Order -- contains lots of DB operations
 * @param userInfo
 * @param orderInfo
 * @param callback
 ***************************************************/
//userInfo. (Json:  name, phone, email )
//orderInfo (oJsonArray: spot_id,valid_date,quantity_price)
exports.placeOrder = function(userInfo, orderInfo, adminUsername, callback){

    var connection = dbPool.connection;
    //Use mysql-queues to handle mysql single transaction problem
    // during ordering.
    var queues = require('mysql-queues');
    const DEBUG = true;
    queues(connection, DEBUG);

    //Need async.waterfall to pass parameters in
    //Insert Customer, pass the customerId to order table
    //Insert Order, pass the orderId to voucher table.
    //Need to take care of the rollback technique when one of the steps failed.

    var hasError = false;

    var confirmationCode = stringUtils.generateRandomString(constants.CONFIRM_CODE_LENGTH);
    var returnObject = {};
    returnObject.confirmCode = confirmationCode;
    returnObject.userInfo = userInfo;
    returnObject.orderInfo = orderInfo;
    returnObject.isSuccess = false;

    //need to check whether the confirmationCode is duplicate or not

    async.waterfall([
        //first step, get/create the customerId based on customer information
        function(callback1){

            var params = [userInfo.customerName, userInfo.mobilePhone];
            var selectSql = "select customer_id from "+tableNames.customerTable + " where customer_name=? and mobile_phone = ? ";
            runQueryWithParams(selectSql,params, function(error,results){
                if(error) {
                    hasError = true;
                    console.warn("select customer_id failed!"+error);
                    //connection.end();
                    //callback(returnObject);
                    //return;
                }

                if(results && results.length>0) {
                    console.log("customer found, id is "+results[0].customer_id);
                    callback1(null, results[0].customer_id);
                } else {
                       var insertCustomerSQL = "insert into " + tableNames.customerTable + " ( customer_name, mobile_phone, email, is_registered ) " +
                           " VALUES ( ?,?,?,? )";
                       var params = [userInfo.customerName, userInfo.mobilePhone, userInfo.email, 'N'];

                       runQueryWithParams(insertCustomerSQL,params,function(error,results) {
                           if(error) {hasError = true; console.warn("insert new customer record failed!"+error); return;}
                           console.log("new customer id "+results.insertId+ " created!");
                           callback1(null,results.insertId);
                       })
                }
            })


        },
        //Second step, insert new order record with the returned customerId
        //Third step, insert all the vouchers related to this offer
        function(customerId, callback2){

            //generate orderId
            var orderId = stringUtils.generateOrderId(customerId);

            returnObject.userInfo.customerId = customerId;
            returnObject.orderInfo.orderId = orderId;

            var trans = connection.startTransaction();
            function error(err) {
                if(err && trans.rollback) {
                    hasError = true;
                    trans.rollback();
                    console.error("Insert order transaction failed, rolling back!"+err);
                    //connection.end();
                    callback(returnObject);
                    throw err;
                }
            }

            var insertOrderSQL = " insert into "+ tableNames.orderTable + " (order_id,customer_id, total_order_amount, confirmation_code, " +
                " order_status, description,created_by,last_updated_by ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ";
            var params = [orderId,customerId, orderInfo.totalAmount, confirmationCode, constants.ORDER_STATUS.BOOKED, 'N/A',adminUsername,adminUsername];

            trans.query(insertOrderSQL, params, error);

            var vouchers = orderInfo.vouchersArray;

            var insertVoucherSQL = " insert into " + tableNames.voucherTable + " ( voucher_id, order_id, offer_id, sku_id , schedule_id, quantity, " +
                " valid_date, offer_subtotal_amount, sku_type,created_by,last_updated_by  ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?,?,?,?) ";

            console.dir(vouchers);

            for(var i in vouchers) {
                var voucherId = ""+orderId+i;
                var voucher = vouchers[i];
                console.info("Inserting vouchers-"+voucher);
                var params=[voucherId,orderId, voucher.offerId, voucher.skuId, voucher.scheduleId, voucher.quantity, voucher.validDate,
                    voucher.offerSubtotalAmount,constants.SKU_TYPE.ROUTES,adminUsername,adminUsername ];//voucher.voucherDescription];
                trans.query(insertVoucherSQL, params, error);

            }
            trans.execute();

            if(hasError==false) {
                trans.commit();

                callback2(null, 'done');
            } else {
                callback2(null,'failed');
                //connection.end();
                throw new Error("Place order failed!");
            }

        }
    ]
    , function (err, result) {
       if(err) {
           returnObject.isSuccess = false;
           console.error("Error in Place order!");
           //connection.end();
           //callback(returnObject);
       } else if (result=='done') {
           returnObject.isSuccess = true;
           console.log("Place order Success!");
           try{
               var mailOptions = {
                   from: "田园文景<sctravel2014@gmail.com>", // sender address
                   to: userInfo.email, // list of receivers
                   subject: "四川旅游网定票确认 ", // Subject line
                   text: "谢谢你使用四川旅游网. 您的定票已经被确认. 定单确认码是 " + returnObject.confirmCode, // plaintext body
                   html: "<b>谢谢您使用四川旅游网</b> <p>您以下的定票已经被确认. 您可以去我们的网站查询或管理您的定票历史.祝您旅途愉快.</p>" 
						 + "<P>定单确认码:  " + returnObject.confirmCode
						 + "<P><table><tr><td>出发地<td>景点<td>订购<td>日期<td>时间<td>人数<td>价格<td>支付状态</table>"
               };
               mail.sendEmail(mailOptions,function(error, response){
                    if(error){
                       console.log(error);
                    }else{
                        console.log("Email sent: " + response.message);
                       //res.send("ok");
                    }
                })
           } catch (err){
               console.log(err);
           } finally {

           }
       }
       console.log("return from order"+returnObject.confirmCode);
       callback(returnObject);
       //connection.end();
    })

}

/**
 *
 * @param orderId
 * @param status
 * @param totalFee Optional, set to 0 if you don't have to touch it
 * @param callback
 */

var changeOrderStatus = function(orderId, orderStatus, totalFee, adminUsername, callback) {
    var chnageOrderStatusSql = "update " + tableNames.orderTable + " set order_status= ? , total_actual_paid= ?, last_updated_by= ? where order_id = ? ";

    runQueryWithParams(chnageOrderStatusSql,[orderStatus, totalFee , adminUsername,orderId],function(err,results) {
        if(err) {
            callback(err,null);
            return;
        }
        callback(null, results);
    })
}
exports.changeOrderStatus = changeOrderStatus;
/****
 *
 * First compare the total actual paid amount with the total order amount in our DB.
 *   If it doesn't match, somebody must hacked the payment, we should throw an error,
 *      change the status to 'unmatch' and log the how much is being paid actually.
 *   If the total actual paid amount matches the total order amount, update the status to paid
 *      and notify user that the payment is done successfully.
 * @param orderId
 * @param totalFee
 * @param callback
 */
exports.confirmPayment = function(orderId,totalFee,callback) {

    var orderStatus = constants.ORDER_STATUS.PAID;

    var selectAmountSql = "select total_order_amount from "+tableNames.orderTable+ " where order_id = ? ";

    runQueryWithParams(selectAmountSql, [orderId], function(err,results){
        if(err) {
            callback(err,null);
            return;
        }
        if(results && results[0] && results[0].total_order_amount){
            if(totalFee != results[0].total_order_amount) {
                var orderStatus = constants.ORDER_STATUS.UNMATCHED;

                changeOrderStatus(orderId,orderStatus,totalFee,'sysuser',function(err,results){
                    if(err) {
                        callback(err,null);
                        return;
                    }
                    console.warn("The amount paid:"+totalFee+" does not match the amount should be paid:"+results[0].total_order_amount );
                    callback(new Error("The amount paid does not match the amount should be paid. "),null);
                })


            } else {
                changeOrderStatus(orderId,orderStatus,totalFee,'sysuser',function(err,results){
                    if(err) {
                        callback(err,null);
                        return;
                    }
                    console.log("Successfully updated to Paid status for order " + orderId);
                    callback(null,results);
                })
            }
        } else {
            callback(new Error("No such orderId"),null);
            return;
        }



    })

}


