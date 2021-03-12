var mqtt = require('mqtt')
const { macReg} = require('./dataControl')
const {MQTT_CONF} = require('../../conf/configuration')

// scan the mesh for 30s to find whether there is new node to add
function scanMesh (top) {
    var client = mqtt.connect(MQTT_CONF)
    client.subscribe(top,{qos:0})

    client.on('message', function (topic,message) {
        var mesJson = JSON.parse(message)
        macReg(mesJson.dev).then(res => {
            if (res){
                console.log('new node has been added')
            }
        })

    })
    return client  
}

module.exports = {
    scanMesh
}