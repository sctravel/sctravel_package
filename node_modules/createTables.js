var dbPool = require('./createDBConnectionPool');
var tableNames = require('./tableNames');
var constants = require('./constants');
var connection = dbPool.connection;
//var runQuery = dbPool.runQuery;
//var runQueryWithParams = dbPool.runQueryWithParams;


var callback = function(results) {
    console.log(results);
}


var errorHandler = function(err) {
    if (err != null)
    console.log(err);
}

//connection.query('CREATE database sctravel',errorHandler);
//connection.query('USE sctravel');
//connection.query('DROP TABLE t_tickets_sold',errorHandler);
//connection.query('DROP TABLE t_tickets_inventory',errorHandler);
//connection.query('DROP TABLE t_orders',errorHandler);
//connection.query('DROP TABLE t_scenery_spots',errorHandler);

connection.connect();


var dropTableSQLs=[];

var dropTableSQL0='DROP TABLE '+ tableNames.adminLoginTable;
var dropTableSQL1='DROP TABLE '+ tableNames.adminToolPermissionTable;
var dropTableSQL2='DROP TABLE '+ tableNames.spotTable;
var dropTableSQL3='DROP TABLE '+ tableNames.adminLoginHistoryTable;
var dropTableSQL4='DROP TABLE '+ tableNames.routeTable;
var dropTableSQL5='DROP TABLE '+ tableNames.busTable;
var dropTableSQL6='DROP TABLE '+ tableNames.driverTable;
var dropTableSQL7='DROP TABLE '+ tableNames.offerTable;
var dropTableSQL8='DROP TABLE '+ tableNames.mappingTable;
var dropTableSQL9='DROP TABLE '+ tableNames.scheduleTable;
var dropTableSQL10='DROP TABLE '+ tableNames.customerTable;
var dropTableSQL11='DROP TABLE '+ tableNames.orderTable;
var dropTableSQL12='DROP TABLE '+ tableNames.voucherTable;
var dropTableSQL13='DROP TABLE '+ tableNames.unitTable;

dropTableSQLs.push(dropTableSQL13);
dropTableSQLs.push(dropTableSQL12);
dropTableSQLs.push(dropTableSQL11);
dropTableSQLs.push(dropTableSQL10);
dropTableSQLs.push(dropTableSQL9);
dropTableSQLs.push(dropTableSQL8);
dropTableSQLs.push(dropTableSQL7);
dropTableSQLs.push(dropTableSQL6);
dropTableSQLs.push(dropTableSQL5);
dropTableSQLs.push(dropTableSQL4);
dropTableSQLs.push(dropTableSQL3);
dropTableSQLs.push(dropTableSQL2);
dropTableSQLs.push(dropTableSQL1);
dropTableSQLs.push(dropTableSQL0);



//Table SC_SCENERY_SPOTS
var createTableSQL2='CREATE TABLE ' + tableNames.spotTable +
    ' ( spot_id INT PRIMARY KEY , ' +
    ' spot_name VARCHAR(127)  CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL, ' +
    ' spot_type VARCHAR(31), ' +
    ' longitude DECIMAL(20,6) NOT NULL, ' +
    ' latitude DECIMAL(20,6) NOT NULL, ' +
    ' city VARCHAR(63)  CHARACTER SET utf8 COLLATE utf8_general_ci , ' +
    ' address VARCHAR(255)  CHARACTER SET utf8 COLLATE utf8_general_ci , ' +
    ' post_code VARCHAR(11), ' +
    ' phone VARCHAR(50),' +
    ' hours VARCHAR(50), ' +
    ' url VARCHAR(255),' + //static url page of this scenery spot
    ' is_scenery ENUM(\'Y\', \'N\') DEFAULT \'Y\' ,' +
    ' is_start ENUM(\'Y\', \'N\') DEFAULT \'Y\' ,' +
    ' is_active ENUM(\'Y\', \'N\') DEFAULT \'Y\' ,' +
    ' creation_datetime TIMESTAMP default now(), ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\', ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
    ' UNIQUE(spot_name)  ' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8 ';


//Table SC_SKU_ROUTES
var createTableSQL4= 'CREATE TABLE ' + tableNames.routeTable +
    ' ( route_id INT PRIMARY KEY , ' +
    ' departure_spot_id INT NOT NULL, ' +
    ' arrival_spot_id INT NOT NULL, ' +
    ' to_label VARCHAR(100)  CHARACTER SET utf8 COLLATE utf8_general_ci ,  ' +
    ' is_round_trip ENUM(\'Y\', \'N\') DEFAULT \'N\',' +
    ' distance DECIMAL(10,3) , ' +
    ' travel_time_in_minutes INT, ' +
    ' duration_in_minutes INT, ' +
    ' route_description VARCHAR(127)  CHARACTER SET utf8 COLLATE utf8_general_ci , ' +
    ' base_price DECIMAL(20,6), ' +
    ' is_active ENUM(\'Y\', \'N\') DEFAULT \'Y\' ,' +
    ' creation_datetime TIMESTAMP DEFAULT now(), ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\', ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
    ' UNIQUE(route_id), ' +
    ' FOREIGN KEY routes_f_key_depart_spot (departure_spot_id) REFERENCES '+ tableNames.spotTable+'(spot_id) ON DELETE CASCADE , ' +
    ' FOREIGN KEY routes_f_key_arrive_spot (arrival_spot_id) REFERENCES '+ tableNames.spotTable+'(spot_id) ON DELETE CASCADE   ' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8 ';

//Table SC_OFFERS
var createTableSQL7='CREATE TABLE ' + tableNames.offerTable +
    ' ( offer_id INT PRIMARY KEY, ' +
    ' offer_name VARCHAR(127)  CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL, ' +
    ' offer_price DECIMAL(20,6) NOT NULL, ' +
    ' is_round_trip ENUM(\'Y\', \'N\') DEFAULT \'N\',' +
    ' offer_description VARCHAR(255)  CHARACTER SET utf8 COLLATE utf8_general_ci ,' +
    ' creation_datetime TIMESTAMP DEFAULT now(),' +
    ' is_active ENUM(\'Y\', \'N\') DEFAULT \'Y\' ,' +
    ' last_updated_by VARCHAR(15) default \'sysuser\' , ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8  ';


//Table SC_SKU_OFFER_MAPPING
var createTableSQL8='CREATE TABLE ' + tableNames.mappingTable +
    ' ( offer_id INT NOT NULL, ' +
    ' sku_id INT NOT NULL, ' +
    ' sku_type ENUM(\'T\',\'R\') NOT NULL, ' +
    ' category VARCHAR(50)  CHARACTER SET utf8 COLLATE utf8_general_ci ,' +
    ' sequence INT DEFAULT 2,' +
    ' creation_time TIMESTAMP DEFAULT now(), ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\' , ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,' +
    ' UNIQUE(offer_id,sku_id),  ' +
    ' FOREIGN KEY mapping_f_key_offer (offer_id) REFERENCES '+tableNames.offerTable+'(offer_id) ON DELETE CASCADE ' +
  //' FOREIGN KEY tickets_f_key_sku (sku_id) REFERENCES SC_SKUS(sku_id) ON DELETE CASCADE ' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8  ';

//Table SC_SCHEDULES
var createTableSQL9='CREATE TABLE ' + tableNames.scheduleTable +
    ' ( schedule_id INT PRIMARY KEY AUTO_INCREMENT, ' +
    ' route_id INT NOT NULL, ' +
    ' departure_time VARCHAR(10) NOT NULL, ' +
    ' capacity INT NOT NULL, ' +
    ' bus_id INT, ' +
    ' driver_id INT, ' +
    ' schedule_date DATE DEFAULT NULL, ' + //Used in override, default is NULL
    ' creation_datetime TIMESTAMP DEFAULT now(), ' +
    ' is_active ENUM(\'Y\', \'N\') DEFAULT \'Y\' , ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\', ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
    ' FOREIGN KEY schedule_f_key_route (route_id) REFERENCES '+tableNames.routeTable+'(route_id) ON DELETE CASCADE ' + //no sku table anymore
    //' FOREIGN KEY schedule_f_key_bus (bus_id) REFERENCES '+tableNames.busTable+'(bus_id) ON DELETE CASCADE, ' +
    //' FOREIGN KEY schedule_f_key_driver (driver_id) REFERENCES '+tableNames.driverTable+'(driver_id) ON DELETE CASCADE ' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8  ';

//Table SC_BUS_INFO
var createTableSQL5='CREATE TABLE  ' + tableNames.busTable +
    ' ( bus_id INT PRIMARY KEY AUTO_INCREMENT,  ' +
    ' license_plate VARCHAR(15) NOT NULL, '+  //1 is paid, 2 is unpaid, 3 is expired or used
    ' capacity INT NOT NULL, ' +
    ' bus_brand VARCHAR(15), ' +
    ' bus_start_year INT, ' +
    ' bus_type VARCHAR(15), ' +
    ' is_active ENUM(\'Y\', \'N\') DEFAULT \'Y\' ,' +
    ' creation_datetime TIMESTAMP DEFAULT now(), ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\', ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
    ' UNIQUE(license_plate) ' +
    '  )ENGINE=InnoDB DEFAULT CHARSET=utf8  ';

//Table SC_DRIVER_INFO
var createTableSQL6= 'CREATE TABLE ' + tableNames.driverTable +
    ' ( driver_id INT PRIMARY KEY AUTO_INCREMENT, ' +
    ' driver_name VARCHAR(15) NOT NULL, ' +
    ' driver_phone VARCHAR(20) NOT NULL, ' +
    ' driver_sex ENUM(\'M\',\'F\') DEFAULT \'M\' , ' +
    ' driver_age INT, ' +
    ' is_active ENUM(\'Y\', \'N\') DEFAULT \'Y\' ,' +
    ' creation_datetime TIMESTAMP DEFAULT now(), ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\', ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8  ';


var createTableSQL10 = 'CREATE TABLE ' + tableNames.customerTable +
    ' ( customer_id INT PRIMARY KEY AUTO_INCREMENT, ' +
    ' customer_name VARCHAR(31)  CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL, ' +
    ' mobile_phone VARCHAR(20) NOT NULL , ' +
    ' email VARCHAR(255), ' +
    ' is_registered ENUM(\'Y\',\'N\'), ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\', ' +
    ' UNIQUE(customer_name, mobile_phone)  ' +  //LOGIN and PASSWORD?
    ' )ENGINE=InnoDB AUTO_INCREMENT=1000000 DEFAULT CHARSET=utf8 ';

var createTableSQL11 = 'CREATE TABLE ' + tableNames.orderTable +
    ' ( order_id VARCHAR(17) PRIMARY KEY, ' +
    ' order_datetime TIMESTAMP DEFAULT now(), ' +
    ' customer_id INT, ' +
    ' total_order_amount DECIMAL(20,6) NOT NULL , ' +
    ' confirmation_code VARCHAR(15) NOT NULL, ' +
    ' order_status ENUM(\'booked\',\'paid\',\'cancelled\',\'unmatched\') DEFAULT \'booked\', ' +   //1 is reserved (not paid), 2 is paid, 3 is cancelled, 4 is unmatched (hacked)
    ' description  VARCHAR(31), ' +
    ' total_actual_paid DECIMAL(20,6) DEFAULT 0, ' +
    ' created_by VARCHAR(15) DEFAULT \'sysuser\', ' +
    ' creation_datetime TIMESTAMP DEFAULT now(), ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\', ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
    ' FOREIGN KEY order_f_key_customer (customer_id) REFERENCES '+tableNames.customerTable+'(customer_id) ON DELETE CASCADE ' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8 ';

var createTableSQL12='CREATE TABLE ' + tableNames.voucherTable +
    ' ( voucher_id VARCHAR(18) PRIMARY KEY, ' +
    ' order_id VARCHAR(16) NOT NULL, ' +
    ' offer_id INT NOT NULL, ' +
    ' sku_id INT NOT NULL, ' +
    ' sku_type ENUM(\'T\',\'R\') NOT NULL DEFAULT \'R\', ' +
    ' schedule_id INT, ' + //only route has schedule, if the voucher only contain tickets or others (no route), schedule_id should be null
    ' quantity INT NOT NULL, ' +
    ' valid_date DATE NOT NULL, ' +
    ' offer_quantity INT, ' +
    ' offer_subtotal_amount DECIMAL(20,6), ' +
    ' voucher_description VARCHAR(31), ' +
    ' created_by VARCHAR(15) DEFAULT \'sysuser\', ' +
    ' creation_datetime TIMESTAMP DEFAULT now(), ' +
    ' last_updated_by VARCHAR(15) default \'sysuser\', ' +
    ' last_updated_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
    ' FOREIGN KEY voucher_f_key_order (order_id) REFERENCES '+tableNames.orderTable+'(order_id) ON DELETE CASCADE, ' +
    ' FOREIGN KEY voucher_f_key_offer (offer_id) REFERENCES '+tableNames.offerTable+'(offer_id) ON DELETE CASCADE ' +
    //' FOREIGN KEY voucher_f_key_sku (sku_id) REFERENCES SC_SKUS(sku_id) ON DELETE CASCADE, ' +
    //' FOREIGN KEY voucher_f_key_schedule (schedule_id) REFERENCES '+tableNames.scheduleTable+'(schedule_id) ON DELETE CASCADE ' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8 ';


var createTableSQL13='CREATE TABLE ' + tableNames.unitTable +
    ' ( unit_id VARCHAR(18) PRIMARY KEY , ' +
    ' order_id VARCHAR(16) NOT NULL,' +
    ' offer_id INT NOT NULL, ' +
    ' offer_quantity INT NOT NULL, ' +
    ' offer_subtotal_amount DECIMAL(20,6) , ' +
    ' FOREIGN KEY voucher_f_key_order (order_id) REFERENCES '+tableNames.orderTable+'(order_id) ON DELETE CASCADE, ' +
    ' FOREIGN KEY voucher_f_key_offer (offer_id) REFERENCES '+tableNames.offerTable+'(offer_id) ON DELETE CASCADE ' +
    ' )ENGINE=InnoDB DEFAULT CHARSET=utf8 ' ;


var createTableSQL14 = 'CREATE TABLE ' + tableNames.adminLoginTable +
    ' (username VARCHAR(31) PRIMARY KEY, ' +
    '  name VARCHAR(15) , ' +
    '  password VARCHAR(31), ' +
    '  UNIQUE(username)' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8 ';

var createTableSQL15 = 'CREATE TABLE ' + tableNames.adminToolPermissionTable +
    ' ( tool_id INT NOT NULL, ' +
    '   username VARCHAR(31) NOT NULL, ' +
    '   tool_name VARCHAR(31), ' +
    '   unique (tool_id, username), ' +
    '   creation_datetime TIMESTAMP DEFAULT now(),' +
    '   FOREIGN KEY tool_permission_f_key_username (username) REFERENCES '+tableNames.adminLoginTable+' (username) ON DELETE CASCADE ' +
    '  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 ';

var createTableSQL16 = ' CREATE TABLE ' + tableNames.adminLoginHistoryTable +
    ' ( username VARCHAR(31) NOT NULL ,' +
    '   login_datetime DATETIME  DEFAULT now(), ' +
    '   logout_datetime DATETIME , ' +
    '   random_key VARCHAR(6) NOT NULL, ' + //randomKey is used for identifier of this login activity
    '   FOREIGN KEY login_history_f_key_username (username) REFERENCES '+tableNames.adminLoginTable+' (username) ON DELETE CASCADE ' +
    '  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 ';

var createTableSQLs=[];
createTableSQLs.push(createTableSQL2);
createTableSQLs.push(createTableSQL4);
createTableSQLs.push(createTableSQL5);
createTableSQLs.push(createTableSQL6);
createTableSQLs.push(createTableSQL7);
createTableSQLs.push(createTableSQL8);
createTableSQLs.push(createTableSQL9);
createTableSQLs.push(createTableSQL10);
createTableSQLs.push(createTableSQL11);
createTableSQLs.push(createTableSQL12);
createTableSQLs.push(createTableSQL13);
createTableSQLs.push(createTableSQL14);
createTableSQLs.push(createTableSQL15);
createTableSQLs.push(createTableSQL16);

console.log("Drop tables ...");
//Drop tables first
for(var i in dropTableSQLs) {
   // console.log(dropTableSQLs[i]);
    connection.query(dropTableSQLs[i],errorHandler);
}

console.log("Create tables ...");
//Create tables
for(var i in createTableSQLs) {
   // console.log(dropTableSQLs[i]);
    connection.query(createTableSQLs[i],errorHandler);
}

console.log("Create super admin ...");
 connection.query('insert into ' + tableNames.adminLoginTable + ' (username, name, password) values (\''
	+ constants.SUPER_USER_NAME + '\', \'' + constants.SUPER_USER_NAME + '\', \'' + constants.SUPER_USER_NAME + '\')'
	,errorHandler);


for(var i in constants.ALL_ADMIN_TOOLS) {
 connection.query('insert into ' + tableNames.adminToolPermissionTable + ' (tool_id, username, tool_name) values ('
	+ constants.ALL_ADMIN_TOOLS[i].tool_id + ', \'' + constants.SUPER_USER_NAME + '\', \'' + constants.ALL_ADMIN_TOOLS[i].tool_name + '\')'
	,errorHandler);
}

 connection.query('insert into ' + tableNames.adminToolPermissionTable + ' (tool_id, username, tool_name) values ('
	+ constants.ADMIN_USER_TOOL_ID + ', \'' + constants.SUPER_USER_NAME + '\', \'管理员帐户管理\')'
	,errorHandler);

connection.query('insert into ' + tableNames.adminToolPermissionTable + ' (tool_id, username, tool_name) values ('
	+ constants.USER_PERMISSION_TOOL_ID + ', \'' + constants.SUPER_USER_NAME + '\', \'管理员权限管理\')'
	,errorHandler);
/*
//Create triggers, used for disable cascade
//e.g. we disable a spot, any route related to the spot should be disabled automatically
//     we disable a route, any offer related to the route should be disabled automatically
connection.query('drop trigger disable_offer_after_routes', errorHandler);
connection.query('drop trigger disable_offer_after_routes', errorHandler);
;
connection.query( ' DELIMITER $$  CREATE TRIGGER DISABLE_ROUTES_AFTER_SPOT AFTER UPDATE ' +
 ' ON ' + tableNames.spotTable +
 ' FOR EACH ROW BEGIN ' +
 '   IF NEW.is_active=\'N\' THEN ' +
 '      SET @spotId = NEW.spot_id; ' +
 '      UPDATE SC_SKU_ROUTES SET IS_ACTIVE=\'N\' WHERE arrival_spot_id=@spotId; ' +
 '   END IF; ' +
 ' END$$ DELIMITER ;',errorHandler);


connection.query( ' DELIMITER $$  CREATE TRIGGER disable_offer_after_routes AFTER UPDATE ' +
 ' ON '+ tableNames.routeTable +
 ' FOR EACH ROW BEGIN ' +
 ' DECLARE done INT DEFAULT FALSE; '+
 ' DECLARE ids INT; '+
 ' DECLARE cur CURSOR FOR SELECT distinct OFFER_ID FROM sc_sku_offer_mapping where sku_id=NEW.ROUTE_ID; ' +
 ' DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE; ' +
 ' IF NEW.is_active=\'N\' THEN ' +
 '   OPEN cur; '+
 '   ins_loop: LOOP ' +
 '      FETCH cur INTO ids; '+
 '      IF done THEN ' +
 '        LEAVE ins_loop; ' +
 '      END IF ; ' +
 '       UPDATE SC_OFFERS SET is_active = \'N\'  WHERE offer_id =ids; ' +
 '   END LOOP; ' +
 '   CLOSE cur; ' +
 ' END IF; ' +
 ' END; $$ DELIMITER ;' , errorHandler);
*/
connection.end();


//connection.query('CREATE database sctravel',errorHandler);
//connection.query('USE sctravel');

//connection.query('DROP TABLE SC_SKUS',errorHandler);
//connection.query('DROP TABLE SC_SKU_TICKETS',errorHandler);
//connection.query('DROP TABLE SC_SKU_ROUTES',errorHandler);
//connection.query('DROP TABLE SC_SCENERY_SPOTS',errorHandler);


//connection.query('CREATE UNIQUE INDEX t_orders_IDX_0 on t_orders(confirmation_code)',errorHandler);