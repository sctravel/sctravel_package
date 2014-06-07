/**
 * Created by XiTU on 3/18/14.
 */

exports.SPOTS_IMAGE_PATH = "/data/spots/images/";
exports.SPOTS_CONTENT_PATH = "/data/spots/content/";
exports.SPOTS_STATIC_URL_PREFIX = "/staticUrl/spots/";

exports.TYPE_NUMBER =  "NUMBER";
exports.TYPE_STRING =  "STRING";
exports.TYPE_DATE   =  "DATE";

exports.SESSION_HOURS = 2;  // session expires in 2 hour

exports.ALL_OFFERS_JSON = "ALL_OFFERS_JSON";
exports.CONFIRM_CODE_LENGTH = 10;

exports.SUPER_USER_NAME="scTravelAdmin"; //TODO: change it later

exports.SPOT_TOOL_ID = "1001";
exports.ROUTE_TOOL_ID = "2001";
exports.OFFER_TOOL_ID = "3001";
exports.SCHEDULE_TOOL_ID = "4001";
exports.ORDER_TOOL_ID = "5001";
exports.ADMIN_USER_TOOL_ID = "6001";       //add or delete user
exports.USER_PERMISSION_TOOL_ID = "7001";  //manager user access to each tools

exports.ALL_ADMIN_TOOLS=[{tool_id:1001, tool_name:"景点管理"},
    {tool_id:2001, tool_name:"路线管理"},
    {tool_id:3001, tool_name:"套餐管理"},
    {tool_id:4001, tool_name:"车辆管理"},
    {tool_id:5001, tool_name:"订单管理"}];

exports.ORDER_STATUS = {
    BOOKED:"booked",
    PAID:"paid",
    CANCELLED:"cancelled",
    UNMATCHED:"unmatched"
}

exports.SKU_TYPE = {
   TICKETS: "T",
   ROUTES : "R"
}

