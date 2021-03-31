var express = require('express');
var router = express.Router();
var fs = require("fs");
const { SuccessModel, ErrorModel } = require("../model/resModel")
var mqtt = require('mqtt')
const {MQTT_CONF, dirName} = require('../../conf/configuration')

router.post('/', (req, res, next) => {
    var des_file = dirName + "/" + req.files[0].originalname; //destination folder and name of file

    return fs.readFile( req.files[0].path, function (err, data) {  // Read file data asynchronously
        return fs.writeFile(des_file, data, function (err) { // des_file: file name，data: file data，asynchronously
            if( err ){
                return new ErrorModel({'msg': err, 'status': 400})
            } 
            else{
                return res.json( new SuccessModel({'msg': 'File ' + req.files[0].originalname +' uploaded successfully', 'status': 202})
            )}
        })
    })
});

router.post('/ESP32', (req, res, next) => {
    const board = req.body.Board
    const ver = req.body.Version
    var client = mqtt.connect(MQTT_CONF)
    var message = JSON.stringify(
            { "cmd": "upgrade",
              "version": ver,
              "board": board })
              
    client.on('connect', function () {
        client.publish('/DEMESH/root/control', message, {qos:1})
        client.end()
    })
    return res.json( new SuccessModel({'msg': 'ESP32 will download the Firmaware "'+board+'" v'+ver+' now.', 'status': 202})
    )
});

router.post('/AVR', (req, res, next) => {
    const fileName = req.body.fileName
    const macADR = req.body.macADR
    const macAdress = req.body.macAdress
    var client = mqtt.connect(MQTT_CONF)
    client.subscribe(('/DEMESH/'+macADR+'/acknowledge', {qos:1}))
    var message = JSON.stringify(
            { "dst": macADR,
              "cmd": "avrota",
              "state": "recimg"
            })
              
    client.on('connect', function () {
        client.publish('/DEMESH/root/control', message, {qos:1})
        client.end()
    })
    client.on('message', function () {
        var mesJson = JSON.parse(message)
        if (mesJson.mtype === 'avrota') {
            if(mesJson.state === 'recimg') {
                return
            }
        }
    })
    return res.json( new SuccessModel({'msg': 'Node ' + macADR + 'will download the Firmaware ' + fileName + 'now.', 'status': 202})
    )
});

module.exports = router;