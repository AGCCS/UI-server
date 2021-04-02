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
    dirName = 'D:\\vue\\Git\\UI-server\\public'
}

if (env === 'production') {
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }

    MQTT_CONF = 'mqtt:192.168.2.109:1884'
    jwtKey = 'N27#K$5m_P[C'
    dirName = '/home/pi/Loadstation/UI-server-master/public'
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF,
    MQTT_CONF,
    jwtKey,
    dirName
}
