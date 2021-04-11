const {queryData, dataExec, escape} = require('../db/sqlite')
const {setPhase, setMaxCur} = require('./pubControl')
const {sumManCur, calRemain, autoWork } = require('./dataControl')
const {readAllInfo} = require('./subControl')

// function to get nodestatus from database
const getNodesStatus = (id = {}) => {
    id = escape(id)
    let sql = `select id, macADR, connect, Cur1, Cur2, Cur3, workStatus, sPhases, smaxCur, workmode, maxCur, Phases, cmaxCur, nodeName from nodestatus `
    if (id) {
        sql += `where id = ${id};`
        return queryData(sql).then(rows =>{
            if(rows[0]){
                return rows[0]  // wrong password -> data is null
            }
        })
    }
    sql += `order by connect DESC;`
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
const changeNodeSetting = (id, macADR, smaxCur = null, workmode, sPhases = null)  => {
    let sql = `select connect, workmode, smaxCur, sPhases, cmaxCur, workStatus
    from nodestatus where id= ${escape(id)} and macADR = ${escape(macADR)};`
        return queryData(sql).then(rows => {
        if (!rows[0].connect) {
            return -1 // node has no connection.
        }
        // if EV is already connected, choose the smaller one between smaxCur and cmaxCur
        if (rows[0].cmaxCur > 5 && smaxCur > rows[0].cmaxCur) {
            smaxCur = rows[0].cmaxCur
        }
        const originSMax = rows[0].smaxCur
        const originSPhases = rows[0].sPhases.toString()
        if (workmode === 'manual') {
            workmode = escape(workmode)
            return calRemain().then(remain => {
                var minRemain = 0
                // If node is in ccss 0X -> OFF.
                if(rows[0].workStatus<10 && rows[0].workStatus>=0) {
                        // Check if there is available remaining current
                        if(remain[0] === '') {
                            return -2 // No remaining current can be allocated
                        }
                        if (sPhases.toString().indexOf("1") >= 0) {
                            minRemain = remain[1]
                            remain[1] -= smaxCur
                        }
                        if (sPhases.toString().indexOf("2") >= 0) {
                            if(minRemain=0) {
                                minRemain = remain[2]
                            }
                            else if (minRemain > remain[2]) {
                                minRemain = remain[2]
                            }
                            remain[2] -= smaxCur
                        }
                        if (sPhases.toString().indexOf("3") >= 0) {
                            if(minRemain=0) {
                                minRemain = remain[3]
                            }
                            else if (minRemain > remain[3]) {
                                minRemain = remain[3]
                            }
                            remain[3] -= smaxCur
                        }
                        // The current to be allocated may exceed the maximum total current of mesh
                        if (remain[1]<0 || remain[2]<0 || remain[3]<0) {
                            if (minRemain<5) {
                                return -3 // No current can be allocated in the given phase
                            }
                            // Set the Value of smaxCur as the minimum remaining Current
                            sql = `update nodestatus set workmode=${workmode}, smaxCur = ${minRemain},
                            sPhases = ${escape(sPhases)} where id= ${escape(id)} and macADR = ${escape(macADR)};`
                            return dataExec(sql).then(updateData => {
                                return 1
                            })
                        }
                        // The current to be allocated is valid
                        else {
                            // Set the Value of smaxCur as the given smaxCur
                            sql = `update nodestatus set workmode=${workmode}, smaxCur = ${escape(smaxCur)},
                            sPhases = ${escape(sPhases)} where id= ${id} and macADR = ${escape(macADR)};`
                            return dataExec(sql).then(updateData => {
                                return 1
                            })
                        }
                }
                // If ccss = Ax...Wx -> EV is connected.
                else if (rows[0].workStatus<60){
                    var originRemain = remain
                    // Reset the remaining Current as the current for this node is not allocated yet.
                    if (originSPhases.indexOf("1") >= 0) {
                        remain[1] += originSMax
                    }
                    if (originSPhases.indexOf("2") >= 0) {
                        remain[2] += originSMax
                    }
                    if (originSPhases.indexOf("3") >= 0) {
                        remain[3] += originSMax
                    }
                    if (sPhases.toString().indexOf("1") >= 0) {
                        minRemain = remain[1]
                        remain[1] -= smaxCur
                    }
                    if (sPhases.toString().indexOf("2") >= 0) {
                        if(minRemain=0) {
                            minRemain = remain[2]
                        }
                        else if (minRemain > remain[2]) {
                            minRemain = remain[2]
                        }
                        remain[2] -= smaxCur
                    }
                    if (sPhases.toString().indexOf("3") >= 0) {
                        if(minRemain=0) {
                            minRemain = remain[3]
                        }
                        else if (minRemain > remain[3]) {
                            minRemain = remain[3]
                        }
                        remain[3] -= smaxCur
                    }
                    // The current to be allocated may exceed the maximum total current of mesh
                    if (remain[1]<0 || remain[2]<0 || remain[3]<0) {
                        if (minRemain<5) {
                            return -3 // No current can be allocated in the given phase
                        }
                        // Set the Value of smaxCur as the minimum remaining Current
                        sql = `update nodestatus set workmode=${workmode}, smaxCur = ${minRemain},
                        sPhases = ${escape(sPhases)} where id= ${escape(id)} and macADR = ${escape(macADR)};`
                        return dataExec(sql).then(updateData => {
                            return sumManCur().then(val1 =>{
                                return autoWork().then (val2 => {
                                    return 1
                                })
                            })
                        })
                    }
                    // The current to be allocated is valid
                    else {
                        // Set the Value of smaxCur as the given smaxCur
                        sql = `update nodestatus set workmode=${workmode}, smaxCur = ${escape(smaxCur)},
                        sPhases = ${escape(sPhases)} where id= ${escape(id)} and macADR = ${escape(macADR)};`
                        return dataExec(sql).then(updateData => {
                            return sumManCur().then(val1 =>{
                                return autoWork().then (val2 => {
                                    return 1
                                })
                            })
                        })
                    }
                }
            })
        }
        else {
            sql = `update nodestatus set workmode= 'auto', smaxCur = 0, sPhases = 0
            where id= ${escape(id)} and macADR = ${escape(macADR)};`
            dataExec(sql).then(updateData => {
                return sumManCur().then(val1 =>{
                    return autoWork().then (val2 => {
                        return 1
                    })
                })
            })
        }
    })
    /* Old Version of changeNodeSetting
    let sql = `select connect, workmode, smaxCur, sPhases, cmaxCur, workStatus from nodestatus where id= ${id}`
    return queryData(sql).then(rows => {
        if (!rows[0].connect) {
            return false // node has no connection.
        }
        id = escape(id)
        if( workmode === 'auto') {
            smaxCur = 0
            sPhases = 0
        }
        workmode = escape(workmode)
        const originSMax = rows[0].smaxCur
        const originSPhases = rows[0].sPhases
        // if EV is already there, choose the smaller one between smaxCur and cmaxCur
        if (rows[0].cmaxCur > 5 && smaxCur > rows[0].cmaxCur) {
            smaxCur = rows[0].cmaxCur
        }

        // if EV is not connected, check whether smaxCur will exceed the maximum total current
        if(rows[i].workStatus<10 && rows[i].workStatus>=0) {
            return calRemain().then(remain => {
                if (remain[1]<0 || remain[2]<0 || remain[3]<0) {
            })
        }

        // update the workmode ,smaxCur and sPhases in database.
        sql = `update nodestatus set workmode=${workmode}, smaxCur = ${escape(smaxCur)}, sPhases = ${escape(sPhases)} where id= ${id};`
        return dataExec(sql).then(updateData =>{
            if (updateData.changes > 0) {
                // allocate the power to node in manual mode and ccss>=20. 
                return sumManCur().then(val =>{
                    if(!val) {
                        return false // no connection to database
                    }
                    return calRemain().then(remain => {
                        if (remain[1]<0 || remain[2]<0 || remain[3]<0) {
                            // if remaining current of one phase is negative after collocation, reset smaxCur and sPhases
                            if (rows[0].workStatus >= 20) {
                                setPhase(macADR, originSPhases)
                                setMaxCur(macADR, originSMax)
                            }
                            sql = `update nodestatus set smaxCur = ${originSMax}, sPhases = ${originSPhases} where id= ${id};`
                            return dataExec(sql).then(updateData => {
                                return false
                            })
                        }
                        // if smaxcur and sPhases is valid, allocate the power
                        if (rows[0].workStatus >= 20) {
                            setPhase(macADR, sPhases)
                            setMaxCur(macADR, smaxCur)
                        }
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
    */
}

module.exports = {
    getNodesStatus,
    getNodesList,
    renameNode,
    changeNodeSetting
}