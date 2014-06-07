/******************************************************************
 * SMS短信通API下行接口参数 ( http://sms.webchinese.cn/api.shtml )
 *
 * GBK编码发送接口地址：
 *    http://gbk.sms.webchinese.cn/?Uid=本站用户名&Key=接口安全密码&smsMob=手机号码&smsText=短信内容
 * UTF-8编码发送接口地址：
 *    http://utf8.sms.webchinese.cn/?Uid=本站用户名&Key=接口安全密码&smsMob=手机号码&smsText=短信内容
 * 获取短信数量接口地址(UTF8)：
 *    http://sms.webchinese.cn/web_api/SMS/?Action=SMS_Num&Uid=本站用户名&Key=接口安全密码
 * 获取短信数量接口地址(GBK)：
 *    http://sms.webchinese.cn/web_api/SMS/GBK/?Action=SMS_Num&Uid=本站用户名&Key=接口安全密码

 提示:HTTP调用URL接口时, 参数值必须URL编码后再调用

 参数变量	说明
 Gbk编码Url	http://gbk.sms.webchinese.cn/
 Utf-8编码Url	http://utf8.sms.webchinese.cn/
 Uid	本站用户名（如您无本站用户名请先注册）[免费注册]
 Key	注册时填写的接口秘钥（可到用户平台修改接口秘钥）[立刻修改]
 如需要加密参数，请把Key变量名改成KeyMD5，
 KeyMD5=接口秘钥32位MD5加密，大写。
 smsMob	目的手机号码（多个手机号请用半角逗号隔开）
 smsText	短信内容，最多支持300个字，普通短信70个字/条，长短信64个字/条计费
 多个手机号请用半角,隔开
 如：13888888886,13888888887,1388888888 一次最多对100个手机发送
 短信内容支持长短信，最多300个字，普通短信66个字/条，长短信64个字/条计费

 短信发送后返回值	说　明
 -1	没有该用户账户
 -2	接口密钥不正确 [查看密钥]
 不是账户登陆密码
 -21	MD5接口密钥加密不正确
 -3	短信数量不足
 -11	该用户被禁用
 -14	短信内容出现非法字符
 -4	手机号格式不正确
 -41	手机号码为空
 -42	短信内容为空
 -51	短信签名格式不正确
 接口签名格式为：【签名内容】
 大于0	短信发送数量

 **********************************************************/

var http = require('http');
var request = require("request");
var crypto=require('crypto');


smsKey = '5f89cb44d73302a2ac38' ;//This is the key we used to send our message.
uid = 'sctravel2014'; //our username for the website

//smsSign = "【田园文景旅游服务有限公司】";


var md5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

//MD5 加密后的key, 大写
var smsKeyMD5 = md5(smsKey).toUpperCase();
//console.log(smsKeyMD5.toUpperCase()+" "+smsKeyMD5.length);
exports.sendSms = function(phoneNumber, content, callback) {

    var sendSmsUrl = 'http://utf8.sms.webchinese.cn/';//?Uid='+uid+'&Key='+smsKey+'&smsMob='+phoneNumber+'&smsText='+content;
    var postData = {Uid:uid, KeyMD5:smsKeyMD5, smsMob:phoneNumber,smsText:content};

    request.post({
        url:     sendSmsUrl,
        form:    postData
    }, function(error, response, body){
        console.log(body+" message(s) has been sent to "+phoneNumber);
        callback(body);
    });
}

exports.getSmsNumbers = function(callback) {
    request('http://sms.webchinese.cn/web_api/SMS/?Action=SMS_Num&Uid='+uid+'&Key='+smsKey, function(error, response, body) {
        if(error) {
            console.error(error);
            return;
        }
        callback(body);
    });
}

/*sendSms("13870560238","这是我的第二跳短信.收到了这条短信请QQ留言给我",function(data){
    console.dir(data);
    if(data>0) {
        console.log(data+"条短信已经被发送");
        getSmsNumbers(function(data){
            console.log("还剩"+data+"条短信可以测试");
        });
    } else {
        console.error("发送短信错误，错误代码-"+data);
    }
});

getSmsNumbers(function(data) {
    console.log("还剩"+data+"条短信可以测试");
});*/