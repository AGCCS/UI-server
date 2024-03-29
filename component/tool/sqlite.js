
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql')
const {genPassword} = require('../controller/pwdControl') 

var DB = DB || {};

// create database file
DB.SqliteDB = function(file){
    DB.db = new sqlite3.Database(file);
 
    DB.exist = fs.existsSync(file);
    if(!DB.exist){
        console.log("Creating db file!");
        fs.openSync(file, 'w');
    };
};

// create table
DB.SqliteDB.prototype.createTable = function(sql){
    DB.db.serialize(function(){
        let request = sql
        let parameter = []
        if (Array.isArray(sql) && sql.length > 1) {
          request = sql.shift()
          parameter = sql
        }
        DB.db.run(request, parameter, function(err){
            if(null != err){
                console.log("Error Message:" + err.message + " ErrorNumber:" + err.errno);
                return;
            }
        });
    });
};
 
// update and insert data into table
DB.SqliteDB.prototype.dataExec = function(sql){
    const promise = new Promise((resolve, reject) => {
        let request = sql
        let parameter = []
        if (Array.isArray(sql) && sql.length > 1) {
          request = sql.shift()
          parameter = sql
        }
        DB.db.run(request, parameter, function(err) {
        if(null != err){
            reject(err)
        }
        resolve(this)
        })
    })
    return promise
};

// query data from table
DB.SqliteDB.prototype.queryData = function(sql){
    const promise = new Promise((resolve, reject) => {
        let request = sql
        let parameter = []
        if (Array.isArray(sql) && sql.length > 1) {
          request = sql.shift()
          parameter = sql
        }
        DB.db.all(request, parameter, function(err, rows) {
        if(null != err){
            reject(err)
        }
        resolve(rows)
        })
    })
    return promise
};
 
DB.SqliteDB.prototype.close = function(){
    DB.db.close();
};
var pathExist = fs.existsSync(__dirname+"/dbFile/")
if(!pathExist) {
    fs.mkdirSync(__dirname+"/dbFile/")
}
var dbFile = __dirname+"/dbFile/chargingpark.db"
dbExist = fs.existsSync(dbFile);
var chargingpark = new DB.SqliteDB(dbFile)

// initialize the database
if (!dbExist) {
console.log('database initilization is on.')
let userTableSql = "CREATE TABLE if not exists user(username VARCHAR(25) NOT NULL, "
userTableSql += "password VARCHAR(64) NOT NULL, PRIMARY KEY (username, password), UNIQUE (username));"

let meshsettingSql = "CREATE TABLE if not exists meshsetting(id integer primary key autoincrement NOT NULL, "
meshsettingSql += "wholeMax SMALLINT NOT NULL DEFAULT 100, manUsedCur1 FLOAT(3) NOT NULL DEFAULT 0, "
meshsettingSql += "manUsedCur2 FLOAT(3) NOT NULL DEFAULT 0, manUsedCur3 FLOAT(3) NOT NULL DEFAULT 0, "
meshsettingSql += "manTotalCur1 FLOAT(3) NOT NULL DEFAULT 0, manTotalCur2 FLOAT(3) NOT NULL DEFAULT 0, "
meshsettingSql += "manTotalCur3 FLOAT(3) NOT NULL DEFAULT 0, UNIQUE (id));"

let nodestatusSql = "CREATE TABLE if not exists nodestatus(id integer primary key autoincrement NOT NULL, "
nodestatusSql += "macADR VARCHAR(18), nodeName VARCHAR(25), workStatus SMALLINT, maxCur FLOAT(3), cmaxCur FLOAT(3), "
nodestatusSql += "smaxCur FLOAT(3) DEFAULT 0, workmode VARCHAR(10) DEFAULT 'auto', connect BOOLEAN, chargePro SMALLINT DEFAULT -1, "
nodestatusSql += "Cur1 FLOAT(3), Cur2 FLOAT(3), Cur3 FLOAT(3), Phases SMALLINT, sPhases SMALLINT DEFAULT 0, Parent VARCHAR(24), "
nodestatusSql += "Rssi SMALLINT, Layer SMALLINT, Plat SMALLINT, Version VARCHAR(8), Board VARCHAR(45), avrVer VARCHAR(8), "
nodestatusSql += "UNIQUE (id, macADR, nodeName));"

chargingpark.createTable(userTableSql)
chargingpark.createTable(meshsettingSql)
chargingpark.createTable(nodestatusSql)

const adminPWD = genPassword('123456')
let userInitSql = `insert into user(username, password) values('admin', '${adminPWD}');`
chargingpark.dataExec(userInitSql)

let meshSettingInitSql = `insert into meshsetting(wholeMax) values(100);`
chargingpark.dataExec(meshSettingInitSql)
}


module.exports = {
    dataExec: chargingpark.dataExec,
    queryData: chargingpark.queryData,
    escape: mysql.escape
}