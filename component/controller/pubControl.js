var mqtt = require('mqtt')
const {MQTT_CONF, dirName} = require('../../conf/configuration')
const {readInfo} = require('./subControl')
const crc32 = require('crc32');
var fs = require("fs");

// select the phases for the node
function setPhase (macADR, Phases) {
    var client = mqtt.connect(MQTT_CONF)
    var message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "sphases",
          "avrval": Phases }
    )
    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

// set max Current for the node
function setMaxCur (macADR, maxCur) {
    var client = mqtt.connect(MQTT_CONF)
    var message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "smaxcur",
          "avrval": maxCur*10 }
    )
    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

// function to press button B, only for test
function pressButtonB (macADR) {
    var client = mqtt.connect(MQTT_CONF)
    var message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "opbutton",
          "avrval": 1 }
    )

    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

function Blink (macADR) {
    var client = mqtt.connect(MQTT_CONF)
    var message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "blinks",
          "avrval": 10 }
    )
    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

function noBlink (macADR) {
    var client = mqtt.connect(MQTT_CONF)
    var message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "blinks",
          "avrval": 0 }
    )
    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

function espUpload (version, board) {
    var client = mqtt.connect(MQTT_CONF)
    var message = JSON.stringify(
            { "cmd": "upgrade",
              "version": version,
              "board": board })
              
    client.on('connect', function () {
        client.publish('/DEMESH/root/control', message, {qos:1})
        client.end()
    })
}

function avrUpload (fileName, macADR, macAddr) {
    const firmware = fs.readFileSync(dirName+"/"+fileName)
    const byteLength = firmware.length
    var avraddr = 0
    var client = mqtt.connect(MQTT_CONF)
    // client.subscribe(('/DEMESH/'+macADR+'/acknowledge', {qos:1}))
    client.subscribe('/DEMESH/+/acknowledge',{qos:1})
    var cmd = JSON.stringify(
            { "dst": macADR,
              "cmd": "avrota",
              "state": "recimg"
            })
              
    client.on('connect', function () {
        client.publish('/DEMESH/root/control', cmd, {qos:1})
    })
    client.on('message', function (topic,message) {
        var mesJson = JSON.parse(message)
        if (mesJson.mtype === 'avrota') {
            if(mesJson.state === 'recimg') {
                let avrdata = Buffer.from(firmware.slice(avraddr, avraddr+128), 'binary')
                let avrdataString = avrdata.toString('base64')
                var crc = crc32(avrdata)
                var crcNum = parseInt(crc, 16)
                if (crcNum >= 2**31) {
                    crcNum = crcNum - 2**32
                }
                var mes = JSON.stringify({
                    "dst": macAddr,
                    "cmd": "avrimg",
                    "avraddr": avraddr,
                    "avrdata": avrdataString,
                    "avrcrc": crcNum
                })
                client.publish('/DEMESH/root/control', mes, {qos:1})
            }
            else if (mesJson.state === 'running') {
                readInfo(macADR)
                client.end()
            }
        }
        else if (mesJson.mtype === 'avrimg' && mesJson.avrcrc==='ok') {
            avraddr = mesJson.avraddr+128
            if(avraddr <= byteLength) {
                let avrdata = Buffer.from(firmware.slice(avraddr, avraddr+128), 'binary')
                let avrdataString = avrdata.toString('base64')
                var crc = crc32(avrdata)
                var crcNum = parseInt(crc, 16)
                if (crcNum >= 2**31) {
                    crcNum = crcNum - 2**32
                }
                var mes = JSON.stringify({
                    "dst": macAddr,
                    "cmd": "avrimg",
                    "avraddr": avraddr,
                    "avrdata": avrdataString,
                    "avrcrc": crcNum
                })
                client.publish('/DEMESH/root/control', mes, {qos:1})
            }
            else {
                var mes = JSON.stringify({
                    "dst": macAddr,
                    "cmd": "avrota",
                    "state": "flash",
                    "avrimgcnt": byteLength
                })
                client.publish('/DEMESH/root/control', mes, {qos:1})
            }
        }
    })
}

module.exports = {
    setPhase,
    pressButtonB,
    setMaxCur,
    Blink,
    noBlink,
    espUpload,
    avrUpload
}