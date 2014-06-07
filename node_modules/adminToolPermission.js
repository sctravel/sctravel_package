/**
 * Created by XiTU on 4/27/14.
 *
 * All the operations in this file can only be done by super user
 * We check the username and randomKey to verify the user identity
 *   for each operation
 *
 */

var constants = require('./constants');
var tableNames = require('./tableNames');
var dbPool = require('./createDBConnectionPool');
var runQuery = dbPool.runQuery;
var runQueryWithParams = dbPool.runQueryWithParams;
var connection = dbPool.connection;
var verifyUser = require('./adminLogin').verifyUser;

//Use mysql-queues to handle mysql single transaction problem
// during ordering.
var queues = require('mysql-queues');
const DEBUG = true;
queues(connection, DEBUG);

/*****************************************
 * Admin Tools Permission Management
 *****************************************/

exports.getToolIdsFromUsername = function(username, randomKey, selectedUsername, callback) {

    /*(username != constants.SUPER_USER_NAME) {
        callback(new Error("user - "+username + " don't have permission to retrieve the tool permission information"), null);
        return;
    }*/

    verifyUser(username,randomKey, function(err, results) {
        if(err) {
            console.error(err);
            callback(err,null);
            return;
        }

        if(results && results == "done") {
            var sql = " select tool_id, tool_name from " + tableNames.adminToolPermissionTable + " where username = ? ";

            runQueryWithParams(sql,[selectedUsername], function(err,results){
                if(err) {
                    console.error(err);
                    callback(err,null);
                    return;
                }
                callback(null,results);
            })
        } else {
            calback(new Error("unknown error in getToolIdsFromUsername"),null);
        }
    });

}

/**
 *
 * @param username     username for the user who submitted the request (super user)
 * @param randomKey    randomKey used to verify user identity
 * @param selectedUsername  username who's permissions will be changed
 * @param permissionChanges   permissionChanges [{type,tool_id},...]
 *                  type:add  --  adding permissions
 *                  type:remove -- remove permissions
 * @param callback     'done' / 'failed'
 */
exports.editPermissionsForUser = function(username, randomKey, selectedUsername, permissionChanges, callback) {

    if(username != constants.SUPER_USER_NAME) {
        callback(new Error("user - "+username + " don't have permission to retrieve the tool permission information"), null);
        return;
    }

    verifyUser(username,randomKey, function(err, results) {
        if(err) {
            console.error(err);
            callback(err,null);
            return;
        }

        if(results && results == "done") {
             var addPermissionSql = " insert into " + tableNames.adminToolPermissionTable + " (tool_id, username) values ( ? ,? ) ";
             var removePermissionSql = " delete from " + tableNames.adminToolPermissionTable + " where tool_id = ? and username = ?  " ;

            //Add all the permissions as a batch. Rollback if any one is failed
            var hasError = false;
            var trans = connection.startTransaction();

            //error handling
            function error(err) {
                if(err && trans.rollback) {
                    hasError = true;
                    trans.rollback();
                    console.error("add tool permissions for user failed, rolling back!");
                    throw err;
                }
            }

            for(var i in permissionChanges) {
                var toolId = permissionChanges[i].tool_id;
                var type = permissionChanges[i].type;
                var params=[toolId, selectedUsername];//voucher.voucherDescription];
                if(type=="add") {
                    trans.query(addPermissionSql, params, error);
                } else if(type=="remove") {
                    trans.query(removePermissionSql,params,error);
                } else {
                    hasError = true;
                }
            }

            if(hasError==false) {
                trans.commit();
                callback(null, 'done');
            } else {
                callback(error,'failed');
                trans.rollback();
                throw new Error("Place order failed!");
            }
        }else {
            calback(new Error("unknown error in editPermissions for user:"+selectedUsername),null);
        }
    });

}

