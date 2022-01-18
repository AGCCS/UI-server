const {queryData, dataExec, escape} = require('../tool/sqlite')
const {genPassword} = require('./pwdControl')
var jwt = require('jsonwebtoken')
const {jwtKey} = require('../../conf/configuration')

const login = (username, password) => {
    var content = {username: username}

    // generate the secret password from origin password
    password = genPassword(password)

    const sql = `select * from user where password=? and username=?`
    
    return queryData([sql, password, username]).then(userinfo =>{
        if(userinfo[0]){
        var token = jwt.sign(content, jwtKey, {
            expiresIn: 1 * 60 * 60 * 1000 // 24小时过期,以s作为单位
            })
        // if(username == escape('admin')) {
        //     token = 'Bearer '+token
        // }
        userinfo[0].token = token
        userinfo[0].password = '****'
        return userinfo[0]  // wrong password -> data is null
        }
        return {}
    })
}

const changePWD = (username, newpassword) => {
    // generate the secret password from origin password
    newpassword = genPassword(newpassword)

    let sql = `update user set password=? where username=?;`
    
    return dataExec([sql, newpassword, username]).then(updateData =>{
        if (updateData.changes > 0) {
            return true
        }
        return false
    })
}

const addUser = (username, password) => {
    password = genPassword(password)
    let sql = `insert into user (username, password) values (?, ?);`
    return dataExec([sql, username, password]).then(updateData =>{
        if (updateData.changes > 0) {
            return true
        }
        return false
    })
}

module.exports = {
    login,
    changePWD,
    addUser
}

