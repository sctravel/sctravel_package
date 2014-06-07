/**
 * Created by XiTU on 1/29/14.
 */

var queryDB = require('./queryDB');

var userInfo={};
userInfo.email="test@example.com";
userInfo.mobilePhone="2063102826"
userInfo.customerName="Xi Tu";

var date=new Date();
var valid_date = "2014-04-01";// date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

var orderInfo={};
orderInfo.totalAmount=1028;
orderInfo.orderStatus="booked";
orderInfo.vouchersArray=[];

var voucher1={};
voucher1.offerId=1020;
voucher1.quantity=2;
voucher1.skuId=102;
voucher1.scheduleId=1;
voucher1.validDate=valid_date;
voucher1.voucherDescription="";

orderInfo.vouchersArray.push(voucher1);


var voucher2={};
voucher2.offerId=1020;
voucher2.quantity=2;
voucher2.skuId=2;
voucher2.scheduleId=0;
voucher2.validDate=valid_date;
voucher2.voucherDescription="";


orderInfo.vouchersArray.push(voucher2);


var isSuccess=true;
var handleOrder=function(number) {
    if(number==0) {
        isSuccess=false;
        console.log("handle order failed");
    }
}



queryDB.placeOrder(userInfo,orderInfo,"ABCDEFG",handleOrder);

//queryDB.placeOrder(userInfo,orderInfoArray,handleOrder);
/*
var inventory;
queryDB.checkInventory(1,dateString,function(results){
    inventory=results;
    console.log(inventory);
})




var confirmCode="P40DR0QC0TBMY9V";

var order;
queryDB.checkOrder(confirmCode,function(results){
    order=results;
    console.log(order);
})
queryDB.validateTicket(confirmCode,3,dateString,function(num) {
    //num>0, the ticket is valid;
    //otherwise, the ticket is invalid;
    console.log(num.affectedRows+" tickets got validated");
})
//console.log("code reaches its end");
*/
//return;