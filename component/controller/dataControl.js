const {queryData, dataExec, escape} = require('../tool/sqlite')
const {setPhase, setMaxCur} = require('./pubControl')

// ccss: OFFx: off, waiting for EV: Ax, negotiating power: Bx,
// charging: Cx, pausing Px, waiting for power: Wx, z: Error

// // function to register the mac address and id
const macReg = (macADR) => {
    macADR = escape(macADR)
    let sql = `select * from nodestatus where macADR = ${macADR};`
    return queryData(sql).then(rows =>{
        if(rows[0]){
            return false  // macADR is already registered
        }
        sql = `insert into nodestatus (macADR, workmode) values (${macADR}, 'auto');`
        return dataExec(sql).then(updateData =>{
            if (updateData.changes > 0) {
                return true
            }
            return false
        })
    })
}

// get the list of all nodes
const getList = () => {
    let sql = `select id, macADR from nodestatus;`
    return queryData(sql).then(rows =>{
        if(!rows[0]){
            return false  // no info from database
        }
        return rows
    })
}

// require for the info of node according to mac address
const getInfo = (macADR) => {
    macADR = escape(macADR)
    let sql = `select * from nodestatus where macADR = ${macADR};`
    return queryData(sql).then(rows =>{
        if(rows[0]){
            return rows
        }
        return false
    })
}

// update the currentvalue and phases of node which id=? and macADR=?
const currentUpdate = (id, macADR ,maxCur, cmaxCur, phases, cur1, cur2, cur3) => {
    let sql = `select * from nodestatus where id = ${id} and macADR = '${macADR}';`
    return queryData(sql).then(rows => {
        id = escape(id)
        cmaxCur = cmaxCur < 0 ? escape(0) : escape(cmaxCur/10)
        phases = escape(phases)
        // Judging the progress of charging. 
        // chargePro: -1: charging not started yet (default when ccss not Cx), 1: charging just started, the current rises
        // 2: current has risen to the maximum current. 3: batter is almost full, current drop
        var chargePro = -1
        if (rows[0].workStatus <40 && rows[0].workStatus>=30) {
            if (rows[0].chargePro<=0) {
                chargePro = 1
            }
            // if (maxCur == cur1 || maxCur == cur2 || maxCur == cur3 && rows[0].chargePro == 1) {
            if (maxCur == cur1 || maxCur == cur2 || maxCur == cur3) {
                chargePro = 2
            }
            if (maxCur > cur1 && maxCur > cur2 && maxCur > cur3 && rows[0].chargePro >= 2) {
                chargePro = 3
                var minDif = maxCur - Math.max(cur1, cur2, cur3)
                if (minDif > 5) {
                    maxCur -= minDif -5
                }
                else {
                    maxCur -= minDif
                }
                maxCur /= 10
                setMaxCur(macADR, maxCur)
                macADR = escape(macADR)
                maxCur = maxCur < 0 ? escape(0) : escape(maxCur)
                cur1 = cur1 < 0 ? escape(0) : escape(cur1/10)
                cur2 = cur2 < 0 ? escape(0) : escape(cur2/10)
                cur3 = cur3 < 0 ? escape(0) : escape(cur3/10)
                sql = `update nodestatus set smaxCur = ${maxCur}, cmaxCur = ${cmaxCur}, Phases = ${phases}, 
                chargePro = ${chargePro}, cur1 = ${cur1}, cur2 = ${cur2}, cur3 = ${cur3}, 
                maxCur = ${maxCur} where id = ${id} and macADR = ${macADR};`
                return dataExec(sql).then(updateData => {
                    if (updateData.changes) {
                        return sumManCur().then(val1 => {
                            if(val1) {
                                autoWork().then(val2 => {
                                    if(val2) {
                                        return true
                                    }
                                    return false
                                })
                            }
                            return false
                        })   
                    }
                })
            }
        }
        maxCur = maxCur < 0 ? escape(0) : escape(maxCur/10)
        macADR = escape(macADR)
        cur1 = cur1 < 0 ? escape(0) : escape(cur1/10)
        cur2 = cur2 < 0 ? escape(0) : escape(cur2/10)
        cur3 = cur3 < 0 ? escape(0) : escape(cur3/10)
        sql = `update nodestatus set cmaxCur = ${cmaxCur}, Phases = ${phases}, chargePro = ${chargePro},
        cur1 = ${cur1}, cur2 = ${cur2}, cur3 = ${cur3}, maxCur = ${maxCur} where id = ${id} and macADR = ${macADR};`
        return dataExec(sql).then(updateData =>{
            if (updateData.changes > 0) {
                return true 
            }
            return false // id and macADR do not match or no connection(no currentvalue received)
        })
    })
}

// set connect to false when no connection to the node
const connectUpdate = (id, macADR, connect=false) => {
    let sql = ``
    id = escape(id)
    macADR = escape(macADR)
    if(connect) {
        connect = escape(connect)
        sql = `update nodestatus set connect = ${connect} where id = ${id} and macADR = ${macADR};`
    }
    else {
        // If one node lose connection, reset the workmode of node to auto
        connect = escape(connect)
        sql = `update nodestatus set connect = ${connect}, workmode = 'auto', Phases = 0, maxCur = 0, workStatus = 0,
        cur1 = 0, cur2 = 0, cur3 = 0, cmaxCur = 0, sPhases = 0, smaxCur = 0 where id = ${id} and macADR = ${macADR};`
    }
    return dataExec(sql).then(updateData => {
        return true
    })
}

const statusUpdate = (id, macADR, ccss) => {
    id = escape(id)

    // check whether workStatus is changed
    return getInfo(macADR).then(rows => {
        let sql = ``
        if(!rows[0]) {
            return false // no connection to database
        }
        // make no change and return if workStatus do not change.
        if(ccss === rows[0].workStatus) {
            return true 
        }
        // When charging ends up. reset workmode to auto, sphases and smaxCur to zero.
        if (ccss<10 && ccss>=0) {
            setPhase(macADR, 0)
            setMaxCur(macADR, 0)
            sql = `update nodestatus set workStatus = ${escape(ccss)}, workmode = 'auto', smaxCur = 0, sPhases = 0
                where id = ${id} and macADR = ${escape(macADR)};`

        }
        // When wait EV
        else {
            sql = `update nodestatus set workStatus = ${escape(ccss)} where id = ${id} and macADR = ${escape(macADR)};`
        }
        return dataExec(sql).then(updateData => {
            if(!updateData.changes) {
                return false // Database Error
            }
            return sumManCur().then(val1 => {
                if(val1) {
                    autoWork().then(val2 => {
                        if(val2) {
                            return true
                        }
                        return false
                    })
                }
                return false
            })    
        })
    })
}

const infoUpdate = (id, macADR, Parent = null,
    Rssi = null, Layer = null, Plat = null, Version = null, Board = null, avrVer = null) => {
    id = escape(id)
    macADR = escape(macADR)
    let sql = `update nodestatus set `
    if (Parent) {
        Parent = escape(Parent)
        sql+=`Parent=${Parent}, `
    }
    if (Rssi) {
        Rssi = escape(Rssi)
        sql+=`Rssi=${Rssi}, `
    }
    if (Layer) {
        Layer = escape(Layer)
        sql+=`Layer=${Layer}, `
    }
    if (Plat!==null) {
        Plat = escape(Plat)
        sql+=`Plat=${Plat}, `
    }
    if (Version) {
        Version = escape(Version)
        sql+=`Version=${Version}, `
    }
    if (Board) {
        Board = escape(Board)
        sql+=`Board=${Board}, `
    }
    if (avrVer!=null) {
        avrVer = escape(avrVer)
        sql+=`avrVer=${avrVer}, `
    }
    sql += `macADR=${macADR} where id=${id};`
    return dataExec(sql).then(updateData =>{
        if (updateData.changes > 0) {
            return true 
        }
        return false // id and macADR do not match or no connection(no currentvalue received)
    })
}

// calculate the total current that are supplied to manual mode in each phase
const sumManCur = () => {
    // manUsedCur: the power is supplied to the connected EV. manTotalCur: the power should be supplied to the node.
    var manUsedCur1 = 0
    var manUsedCur2 = 0
    var manUsedCur3 = 0
    var manTotalCur1 = 0
    var manTotalCur2 = 0
    var manTotalCur3 = 0
    let sql = `select id, macADR, smaxCur, sPhases, cmaxCur, workStatus, chargePro from nodestatus 
    where workmode='manual' and connect = 1 and workStatus between 10 and 60 order by id;`
    return queryData(sql).then(rows => {
        if(!rows[0]){ // No node in manual mode
            sql = `update meshsetting set manUsedCur1=0, manUsedCur2=0, manUsedCur3=0, manTotalCur1=0, manTotalCur2=0, manTotalCur3=0;`
            return dataExec(sql).then(updateData => {
                if (updateData.changes > 0) {
                    return true
                }
                return false // no connection
            })
        }
        var maxCur=0
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].smaxCur > rows[i].cmaxCur && rows[i].cmaxCur>5) {
                rows[i].smaxCur = rows[i].cmaxCur
                sql = `update nodestatus set smaxCur = '${rows[i].cmaxCur}' where id = '${rows[i].id}' and macADR = '${rows[i].macADR}';`
                dataExec(sql)
            }
            rows[i].Phases = rows[i].sPhases.toString()
            maxCur = rows[i].smaxCur
            // when ccss is Ax -> wait Ev -> only calculate the manTotalCur
            if (rows[i].workStatus<20) {
                if (rows[i].Phases.indexOf("1") >= 0) {
                    manTotalCur1 += maxCur
                }
                if (rows[i].Phases.indexOf("2") >= 0) {
                    manTotalCur2 += maxCur
                }
                if (rows[i].Phases.indexOf("3") >= 0) {
                    manTotalCur3 += maxCur
                }
            }
            else if (rows[i].workStatus>=20) {
                 // when ccss is Bx -> negotiation -> set sPhases and smaxCur
                if (rows[i].workStatus<30) {
                    setMaxCur(rows[i].macADR, rows[i].smaxCur)
                    setPhase(rows[i].macADR, rows[i].sPhases)
                }
                if (rows[i].Phases.indexOf("1") >= 0) {
                    manUsedCur1 += maxCur
                    manTotalCur1 += maxCur
                }
                if (rows[i].Phases.indexOf("2") >= 0) {
                    manUsedCur2 += maxCur
                    manTotalCur2 += maxCur
                }
                if (rows[i].Phases.indexOf("3") >= 0) {
                    manUsedCur3 += maxCur
                    manTotalCur3 += maxCur
                }
            }
        }
        sql = `update meshsetting set manUsedCur1 = ${manUsedCur1}, manUsedCur2 = ${manUsedCur2}, manUsedCur3 = ${manUsedCur3},
        manTotalCur1 = ${manTotalCur1}, manTotalCur2 = ${manTotalCur2}, manTotalCur3 = ${manTotalCur3};`
        return dataExec(sql).then(updateData => {
            return true
        })
    })
}

// For Node in auto workmode
const autoWork = () => {
    // var allUsedCur1 = 0
    // var allUsedCur1 = 0
    // var allUsedCur1 = 0
    return calRemain().then(remain => {
        let sql = `select id, macADR, cmaxCur, smaxCur, sPhases, chargePro, workStatus from nodestatus where workmode='auto'
        and connect = 1 and workStatus between 20 and 40 order by chargePro DESC, cmaxCur;`
        return queryData(sql).then(rows => {
            // calculate the available average Current and number of cars in auto mode
            var autoNum = rows.length
            for (let j = 0; j < rows.length; j++) {
                if(!autoNum) {
                    break
                }
                // if the charging is about to end, no need to optimize its allocation, it releases space in nodeControl
                if (rows[j].chargePro == 3 && rows[j].workStatus<40 && rows[j].workStatus>=30) {
                    rows[j].sPhases = rows[j].sPhases.toString()
                    if (rows[j].sPhases.indexOf("1") >= 0) {
                        remain[1] -= rows[j].smaxCur
                    }
                    if (rows[j].sPhases.indexOf("2") >= 0) {
                        remain[2] -= rows[j].smaxCur
                    }
                    if (rows[j].sPhases.indexOf("3") >= 0) {
                        remain[3] -= rows[j].smaxCur
                    }
                    var totalRemain = calTotalRemain(remain[1],remain[2],remain[3])
                    remain[0] = totalRemain.Phase
                    remain[4] = totalRemain.CurSum
                    autoNum--
                }
                else {
                    var bestResult =calBestCur(autoNum, rows[j].cmaxCur, remain)
                    setPhase(rows[j].macADR, Number(bestResult.Phases))
                    setMaxCur(rows[j].macADR, bestResult.maxCur)
                    sql = `update nodestatus set smaxCur = ${bestResult.maxCur}, sPhases = ${bestResult.Phases}
                    where id = '${rows[j].id}' and macADR = '${rows[j].macADR}';`
                    dataExec(sql)
                    remain = bestResult.remain
                    autoNum = bestResult.autoNum
                }
            }
            return true
        })
    })
}

// calculate the available remaining current and remaining phases
const calRemain = () => {
    let sql = `select * from meshsetting;`
    return queryData(sql).then(rows => {
        if(!rows[0]){
            return false // no connection with database
        }
        var Cur1 = rows[0].wholeMax-rows[0].manUsedCur1
        var Cur2 = rows[0].wholeMax-rows[0].manUsedCur2
        var Cur3 = rows[0].wholeMax-rows[0].manUsedCur3
        var totalRemain = calTotalRemain(Cur1,Cur2,Cur3)
        var CurSum = totalRemain.CurSum
        var Phase = totalRemain.Phase
        return [Phase, Cur1, Cur2, Cur3, CurSum]
    })
}

// calculate the available remaining phases
const calTotalRemain = (Cur1,Cur2,Cur3) =>{
    var Phase = ''
    var CurSum = 0
    if (Cur1>=5) {
        Phase+="1"
        CurSum+=Cur1
    }
    if (Cur2>=5) {
        Phase+="2"
        CurSum+=Cur2
    }
    if (Cur3>=5) {
        Phase+="3"
        CurSum+=Cur3
    }
    return {Phase, CurSum}
}

// calculate the biggest available remaining current and its phase
const calBigRemain = (Cur1, Cur2, Cur3) => {
    var Cur = Cur1
    var Phase = '1'
    if (Cur < Cur2) {
        Cur = Cur2
        Phase = '2'
    }
    if (Cur < Cur3) {
        Cur = Cur3
        Phase = '3'
    }
    if (Cur < 5) {
        Cur = 0
        Phase = ''
    }
    return {Cur, Phase}
}

// calculate the middle available remaining current and its phase
const calMiddleRemain = (Cur1, Cur2, Cur3) => {
    var maxCur = Math.max(Cur1, Cur2, Cur3)
    var minCur = Math.min(Cur1, Cur2, Cur3)
    var Phase = ''
    var Cur = 0
    if (Cur1 < maxCur && Cur1 > minCur) {
        Cur = Cur1
        Phase = '1'
    }
    else if (Cur2 < maxCur && Cur2 > minCur) {
        Cur = Cur2
        Phase = '2'
    }
    else if (Cur3 < maxCur && Cur3 > minCur) {
        Cur = Cur3
        Phase = '3'        
    }
    return {Cur, Phase}
}
// calculate the smallest available remaining current and its phase
const calSmallRemain = (Cur1, Cur2, Cur3) => {
    var Cur = Cur1
    var Phase = '1'
    if (Cur > Cur2) {
        Cur = Cur2
        Phase = '2'
    }
    if (Cur > Cur3) {
        Cur = Cur3
        Phase = '3'
    }
    if (Cur < 5) {
        Cur = 0
        Phase = '0'
    }
    return {Cur, Phase}
}

// calculate the best current value and its phases for the node based on the averageCur
const calBestCur = (autoNum, cmaxCur, remain) => {
    var Phases = ''
    var maxCur = 0
    var phasesArray = new Array()
    var curArray = new Array()
    var PhaseNum= 0
    var averageCur = 0
    for (let i = 0; i < autoNum; i++) {
        averageCur = remain[4] / autoNum
        if(averageCur>=5) {
            break
        }
        autoNum--
}
    // case1: allocate the current as average current or cmaxCur
    for (let x = 0; x < remain[0].length; x++) {
            PhaseNum = remain[0].length-x
            phasesArray[0] = ''
            if( (averageCur/PhaseNum) < cmaxCur && (averageCur/PhaseNum)>=5 ) {
                curArray[0] = averageCur/PhaseNum
                if( (remain[0].indexOf('1') >= 0) && PhaseNum && (remain[1]-curArray[0]>=0)) {
                    PhaseNum--
                    phasesArray[0]+='1'
                }
                if( (remain[0].indexOf('2') >= 0) && PhaseNum && remain[2]-curArray[0]>=0) {
                    PhaseNum--
                    phasesArray[0]+='2'
                }
                if( (remain[0].indexOf('3') >= 0) && PhaseNum && remain[3]-curArray[0]>=0) {
                    PhaseNum--
                    phasesArray[0]+='3'
                }
                break
            }
            else if ((averageCur/PhaseNum) >= cmaxCur) {
                var bigRemain = calBigRemain(remain[1],remain[2],remain[3])
                curArray[0] = cmaxCur
                // allocate Current start with the biggest remaining Current and its Phase
                if (remain[0].indexOf(bigRemain.Phase) >= 0
                && remain[Number(bigRemain.Phase)]>=cmaxCur && PhaseNum) {
                    phasesArray[0]+=bigRemain.Phase
                    PhaseNum--
                }
                if (bigRemain.Phase.indexOf('1')<0 && remain[0].indexOf('1') >=0
                && remain[1] >=cmaxCur && PhaseNum) {
                    phasesArray[0]+='1'
                    PhaseNum--
                }
                if (bigRemain.Phase.indexOf('2')<0 && remain[0].indexOf('2') >=0
                && remain[2] >=cmaxCur && PhaseNum) {
                    phasesArray[0]+='2'
                    PhaseNum--
                }
                if (bigRemain.Phase.indexOf('3')<0 && remain[0].indexOf('3') >=0
                && remain[3] >=cmaxCur && PhaseNum) {
                    phasesArray[0]+='3'
                    PhaseNum--
                }
                break
            }
    }
    
    // case 2,3,4: allocate current according to the value of one phase
    // 2: biggest current, one of the remaining current is too high so that only this phase should be count on
    bigRemain = calBigRemain(remain[1],remain[2],remain[3])
    phasesArray[1] = bigRemain.Phase
    curArray[1] = bigRemain.Cur
    if (curArray[1] > cmaxCur) {
        curArray[1] = cmaxCur
    }

    // 3: middle
    middleRemain = calMiddleRemain(remain[1],remain[2],remain[3])
    curArray[2] = middleRemain.Cur
    phasesArray[2] = bigRemain.Phase+middleRemain.Phase
    
    // 4: smallest, one of the remaining current is too high and makes the averageCur too high
    curArray[3] = calSmallRemain(remain[1],remain[2],remain[3]).Cur
    phasesArray[3] = remain[0]
    if (curArray[3] > cmaxCur) {
        curArray[3] = cmaxCur
    }

    // case5: based on the result of case1, after allocation, one remaining current is less than 5A
    // and thus the average current will lead to a lower efficiency, need to recalculate the average current
    if (phasesArray[0].length) {
        curArray[4] = remain[Number(phasesArray[0][0])]
    }
    else {
        curArray[4] = 0
    }
    phasesArray[4] = phasesArray[0]
    for (let j = 1; j < phasesArray[0].length; j++) {
        if ( (curArray[4]) > remain[Number(phasesArray[0][j])]) { 
            curArray[4] = remain[Number(phasesArray[0][j])]
        }
    }
    if (curArray[4]-curArray[0]>=5) {
        curArray[4] = 0
    }
    else if (averageCur < curArray[4]*phasesArray[4].length){
        averageCur = curArray[4]*phasesArray[4].length
    }


    // select the most effectiv current value and phases without 
    maxCur = curArray[0]
    Phases = phasesArray[0]
    for (let i = 1; i < curArray.length; i++) {
        if ((maxCur*Phases.length) < (curArray[i]*phasesArray[i].length) 
        && ((curArray[i]*phasesArray[i].length)<= averageCur)) {
            maxCur = curArray[i]
            Phases = phasesArray[i]
        }
    }
    if (Phases.indexOf('1')>=0) {
        remain[1]-=maxCur
    }
    if (Phases.indexOf('2')>=0) {
        remain[2]-=maxCur
    }
    if (Phases.indexOf('3')>=0) {
        remain[3]-=maxCur
    }

    var totalRemain = calTotalRemain(remain[1],remain[2],remain[3])
    remain[0] = totalRemain.Phase
    remain[4] = totalRemain.CurSum
    autoNum--
    return {Phases, maxCur, remain, autoNum}
}

module.exports = {
    macReg,
    getList,
    currentUpdate,
    connectUpdate,
    calRemain,
    statusUpdate,
    sumManCur,
    autoWork,
    getInfo,
    infoUpdate
}