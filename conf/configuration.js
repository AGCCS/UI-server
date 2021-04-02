const env = process.env.NODE_ENV // environment parameter

let MYSQL_CONF
let REDIS_CONF

if (env === 'dev') {
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
    
    MQTT_CONF = 'mqtt:192.168.2.109:1884'
    jwtKey = 'N27#K$5m_P[C'
    dirName = '/home/pi/Loadstation/UI-server-2.0-demo/public'
}

if (env === 'production') {
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }

    MQTT_CONF = 'mqtt:192.168.5.1:1884'
    jwtKey = 'N27#K$5m_P[C'
    dirName = '/home/pi/Loadstation/UI-server-2.0-demo/public'
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF,
    MQTT_CONF,
    jwtKey,
    dirName
}
