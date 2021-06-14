const { ErrorModel } = require('../model/resModel')
var jwt = require('jsonwebtoken')
const {jwtKey} = require('../../conf/configuration')

module.exports = (req, res, next) => {
    if (!res.headers.authorization) {
        return res.json( new ErrorModel(meta= {'msg': 'No authorization in headers', 'status': 401}))
    }
    jwt.verify(req.headers.authorization, jwtKey, (err, data) => {
        if (err) {
            return res.json( new ErrorModel(meta ={'error': err, status :401}))
        }
        if (data.username === 'admin') {
            next()
            return
        }
        return res.json( new ErrorModel(meta= {'msg': 'Users except Admin has only permission to read data',
        'status': 401}))
    })
}