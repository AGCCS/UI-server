var aedes = aedes || {};
aedes.aedesMQTT = function (settings, Port, wsPort) {
    aedes.server = require('aedes')(settings)
    const server = require('net').createServer(aedes.server.handle)
    const httpServer = require('http').createServer()
    const ws = require('websocket-stream')
    ws.createServer({ server: httpServer }, aedes.server.handle)
    server.listen(Port, function() {
        console.log('Aedes MQTT listening on port: ' + Port)
    })
    httpServer.listen(wsPort, function () {
        console.log('Aedes MQTT-WS listening on port: ' + wsPort)
    });
}

aedes.aedesMQTT.prototype.discon = function(callback) {
    aedes.server.on('clientDisconnect', function(client) {
        if(callback) {
            callback(client)
        }
    })
}

aedes.aedesMQTT.prototype.pub = function(callback) {
    aedes.server.on('publish', function(packet, client) {
        if(callback) {
            callback(packet, client)
        }
    })
}

aedes.aedesMQTT.prototype.sub = function(callback) {
    aedes.server.on('subscribe', function(subscriptions, client) {
        if(callback) {
            callback(subscriptions, client)
        }
    })
}
aedes.aedesMQTT.prototype.con = function(callback) {
    aedes.server.on('client', function(client) {
        if(callback) {
            callback(client)
        }
    })
}

exports.aedesMqtt = aedes.aedesMQTT