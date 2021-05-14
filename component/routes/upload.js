var express = require('express');
var router = express.Router();
var fs = require("fs");
const { SuccessModel, ErrorModel } = require('../model/resModel')
const {dirName} = require('../../conf/configuration')
const {espUpload, avrUpload} = require('../controller/pubControl');
const adminCheck = require('../midware/adminCheck');

router.post('/', adminCheck, (req, res, next) => {
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

router.post('/ESP32', adminCheck, (req, res, next) => {
    const board = req.body.Board
    const version = req.body.Version
    espUpload(version, board)
    return res.json( new SuccessModel({'msg': 'ESP32 will download the Firmaware "'+board+'" v'+version+' now.', 'status': 202})
    )
});

router.post('/AVR', adminCheck, (req, res, next) => {
    const fileName = req.body.fileName
    const macADR = req.body.macADR
    const macAddr = req.body.macAdress
    avrUpload(fileName, macADR, macAddr)
    return res.json( new SuccessModel({'msg': 'Node ' + macADR + 'will download the Firmaware ' + fileName + 'now.', 'status': 202})
    )
});

module.exports = router;