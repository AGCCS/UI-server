const {queryData, dataExec, escape} = require('../db/sqlite')
const {setPhase, setMaxCur} = require('./pubControl')
const {sumManCur, calRemain, autoWork } = require('./dataControl')
const {readAllInfo} = require('./subControl')

// function to get nodestatus from database
const getNodesStatus = (id = {}) => {
    id = escape(id)
    let sql = `select * from nodestatus `
    if (id) {
        sql += `where id = ${id};`
        return queryData(sql).then(rows =>{
            if(rows[0]){
                return rows[0]  // wrong password -> data is null
            }
        })
    }
    sql += `order by id;`
    // return promise object 
    return queryData(sql)
}

// function to get nodelist from database
const getNodesList = (id = {}) => {
    readAllInfo()
    let sql = `select id, nodeName, macADR, connect, Parent,
    Rssi, Layer, Plat, Version, Board, avrVer from nodestatus `
    id = escape(id)
    if (id) {
        sql += `where id = ${id};`
        return queryData(sql).then(rows =>{
            if (rows[0]) {
                return rows[0]  // wrong password -> data is null
            }
        })
    }
    sql += `order by id;`
    // return promise object 
    return queryData(sql).then(rows => {
        if (rows[0]) {
            return rows
        }
    })
}

// function to put the name of node into database
const renameNode = (id, nodeName = {})  => {
    id = escape(id)
    nodeName = escape(nodeName)
    const sql = `update nodestatus set nodeName=${nodeName} where id=${id};`  
    // return promise object 
    return dataExec(sql).then(updateData =>{
        if (updateData.changes > 0) {
            return true
        }
        return false
    })
}

// function to post the setting of node to database and node
const changeNodeSetting = (id, macADR, smaxCur = null, workmode = null, sPhases = null)  => {
    id = escape(id)
    if( workmode === 'auto') {
        smaxCur = 0
        sPhases = 0
    }
    workmode = escape(workmode)
    
    let sql = `select connect, workmode, smaxCur, sPhases, cmaxCur, workStatus from nodestatus where id= ${id}`
    return queryData(sql).then(rows => {
        if (!rows[0].connect) {
            return false
        }
        const originSMax = rows[0].smaxCur
        const originSPhases = rows[0].sPhases
        if (rows[0].cmaxCur > 5 && smaxCur > rows[0].cmaxCur) {
            smaxCur = rows[0].cmaxCur
        }
        // update the workmode ,smaxCur and sPhases in database at first
        sql = `update nodestatus set workmode=${workmode}, smaxCur = ${escape(smaxCur)}, sPhases = ${escape(sPhases)} where id= ${id};`
        return dataExec(sql).then(updateData =>{
            if (updateData.changes > 0) {
                return sumManCur().then(val =>{
                    if(!val) {
                        return false // no connection to database
                    }
                    return calRemain().then(remain => {
                        if (remain[1]<0 || remain[2]<0 || remain[3]<0) {
                            // if remaining current of one phase is negative after collocation, reset smaxCur and sPhases
                            sql = `update nodestatus set smaxCur = ${originSMax}, sPhases = ${originSPhases} where id= ${id};`
                            return dataExec(sql).then (updateData => {
                                return false
                            })
                        }
                        setPhase(macADR, sPhases)
                        setMaxCur(macADR, smaxCur)
                        return autoWork().then(val => {
                            if(val) {
                                return true
                            }
                            return false
                        })
                    })
                })
            }
            return false // err: failed to change the workmode and maxcur of node, no connection to database
        })
    })
}

module.exports = {
    getNodesStatus,
    getNodesList,
    renameNode,
    changeNodeSetting
}