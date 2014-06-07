/**
 * Created by XiTU on 4/20/14.
 */

var crypto 		= require('crypto');
var tableNames = require('./tableNames');
var conn = require('./createDBConnectionPool');
var stringUtil = require('./stringUtils');
var dbPool = require('./createDBConnectionPool');
var constant = require('./constants');

function loginAdminLoginHistory(username, callback) {
    var randomKey = stringUtil.generateRandomString(6);
    var returnObject = {};
    returnObject.username = username;
    returnObject.randomKey = randomKey;

    var sql = "insert into " + tableNames.adminLoginHistoryTable + " ( username, random_key ) values (? , ?) ";

    dbPool.runQueryWithParams(sql,[username,randomKey],function(err,results) {

        if(err) {
            callback(err, null);
            return;
        }

        if(results && results.affectedRows==1) {
            console.log("user-"+username+" logged in.");
            callback(null, returnObject);
        } else {
            calback(new Error("unknown error"),null);
        }
    })
}

exports.logoutAdminLoginHistory = function(username, randomKey, callback) {

    var sql = "update " + tableNames.adminLoginHistoryTable + " set logout_datetime = now() " +
        " where username = ? and random_key = ? and logout_datetime is null ";

    dbPool.runQueryWithParams(sql,[username,randomKey],function(err,results) {

        if(err) {
            callback(err, null);
            return;
        }
        console.dir(results);
        if(results&&results.affectedRows==1) {
            console.log("user-"+username+" logged out.");
            callback(null, "done");
        } else {
            calback(new Error("unknown error"),null);
        }
    })
}

exports.manualLogin = function(username, pass, callback) {
    var authSql = " select username, password from " +tableNames.adminLoginTable+ " where username=? ";

    var returnObj = {};
    returnObj.isAuthenticated = false;

    //TODO hash the password
    conn.runQueryWithParams(authSql,[username], function(err,results) {
        if(err) {
            returnObj.errorMessage="Internal error, please try again";
            callback(err,returnObj);
            return;
        }
        console.dir(results);
        if(results && results.length==1) {
            if(results[0].password===pass){//validatePassword(pass,results[0].password )) {
                loginAdminLoginHistory(username, function(err, logResult){
                    if(err) {
                        console.err(err);
                        callback(err,returnObj);
                        return;
                    }
                    returnObj.isAuthenticated = true;
                    returnObj.username = logResult.username;
                    returnObj.randomKey = logResult.randomKey;
                    callback(null, returnObj);
                })

            } else {
                returnObj.errorMessage = " 密码不正确. ";
                callback(null, returnObj);
            }
        } else {
            returnObj.errorMessage = " 该用户不存在. ";
            callback(null, returnObj);
        }
    });


}
function verifyUser(username, randomKey, callback) {
    var verifySql = " select  random_key from " + tableNames.adminLoginHistoryTable  +
        " where username = ? and login_datetime > now() - INTERVAL "+ constant.SESSION_HOURS + " HOUR ";

    dbPool.runQueryWithParams(verifySql, [username], function(err, results){
        if(err) {
            callback(err,null);
            return;
        }
        if(results && results.length>=1) {
            for(var i in results) {
                if(results[i].random_key == randomKey) {
                    console.info("user-"+username+" verified.");
                    callback(null,"done");
                    return;
                }
            }
            callback(new Error("no randomKey matches"),null);

        } else {
            callback(new Error("unknown error"),null);
        }
    })
}
exports.verifyUser = verifyUser;



/* private encryption & validation methods */

var generateSalt = function()
{
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

var md5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass)
{
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    return hashedPass === validHash;
}