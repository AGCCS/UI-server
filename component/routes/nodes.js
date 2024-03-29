var express = require('express');
var router = express.Router();
const { SuccessModel, ErrorModel } = require("../model/resModel")
const { getNodesStatus,
        renameNode, 
        getNodesList,
        changeNodeSetting} = require('../controller/nodeControl')
const {pressButtonB, Blink, noBlink} = require('../controller/pubControl')
const { adminCheck, userCheck } = require('../midware/adminCheck')

/* GET nodes listing or the information of one paticular node with id. */
router.get('/list', userCheck, (req, res, next) => {
  id = req.query.id
  const result = getNodesList(id)
  return result.then(NodesList => {
    if (id) {
      return res.json (
        new SuccessModel({'msg': 'successfully get the information of node with id = '+id+'.', 'status': 200}, NodesList)
      )
    }
      return res.json (
        new SuccessModel({'msg': 'successfully get the list of nodes', 'status': 200}, NodesList)
      )
  })
});

/* GET nodes status. */
router.get('/status', userCheck, (req, res, next) => {
  id = req.query.id
  const result = getNodesStatus(id)
  return result.then(nodeStatus => {
    if (id) {
      return res.json (
        new SuccessModel({'msg': 'successfully get the status of node with id = '+id+'.', 'status': 200}, nodeStatus)
      )
    }
    return res.json (
      new SuccessModel({'msg': 'successfully get the status of nodes', 'status': 200}, nodeStatus)
    )
  })
});

/* Put the name of a node */
router.put('/list', adminCheck, (req, res, next) => {
  const {id, nodeName} = req.body
    if(id){
      const result = renameNode(id, nodeName)
      return result.then(val => {
          if (val) {
            return res.json( new SuccessModel({'msg': 'successfully rename the node', 'status': 202})
          )}
          return res.json(
            new ErrorModel({'msg': 'Failed to rename the node because of no such id of node', 'status': 422})
          )
      })
    }
    return res.json(
      new ErrorModel({'msg': 'Failed to rename the node because of no id', 'status': 400})
    )
});

/* Put the setting of a node */
router.put('/status', adminCheck, (req, res, next) => {
  const {id, macADR, smaxCur, workmode, sPhases} = req.body
    if(id){
      const result = changeNodeSetting(id, macADR, smaxCur, workmode, sPhases)
      return result.then(val => {
        let model
        switch (val) {
          case -1: model = new ErrorModel({'msg': 'Failed, cause node cannot work now', 'status': 404}); break
          case -2: model = new ErrorModel({'msg': 'Failed, cause no valid remaining current in given parameters', 'status': 400}); break
          case -3: model = new ErrorModel({'msg': 'Failed, cause no valid remaining current in all phases', 'status': 406}); break
          case 1: model = new SuccessModel({'msg': 'successfully change the setting the node', 'status': 200}); break
          case 2: model = new SuccessModel({'msg': 'Settings are adjusted to avoid exceeding the maximum current', 'status': 201}); break
        }
        return res.json(model)
      })
    }
    return res.json(
      new ErrorModel({'msg': 'Failed to change the setting of the node because of no id', 'status': 400})
    )
});

// function to press button B, only for test
router.put('/buttonB', adminCheck, (req, res, next)=> {
  const {macADR} = req.body
  pressButtonB(macADR)
  return res.json( new SuccessModel({'msg': 'successfully pressed the operation button remotely', 'status': 200}))
});

// function to blink the node
router.put('/Blink', adminCheck, (req, res, next)=> {
  const {macADR} = req.body
  Blink(macADR)
  return res.json( new SuccessModel({'msg': 'successfully blink the node remotely', 'status': 200}))
});

// function to stop blinking the node
router.put('/noBlink', adminCheck, (req, res, next)=> {
  const {macADR} = req.body
  noBlink(macADR)
  return res.json( new SuccessModel({'msg': 'successfully stop the node from blinking remotely', 'status': 200}))
});


module.exports = router;