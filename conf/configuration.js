const env = process.env.NODE_ENV // environment parameter

let MQTT_CONF, REDIS_CONF, jwtKey, dirName, defaultUser, defaultPwd

if (env === 'dev') {
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
    
    MQTT_CONF = 'mqtt:192.168.5.1:1884'
    jwtKey = 'N27#K$5m_P[C'
    dirName = '/tmp'
    defaultUser = 'admin'
    defaultPwd = '123456'
}

if (env === 'production') {
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }

    MQTT_CONF = 'mqtt:192.168.5.1:1884'
    jwtKey = 'N27#K$5m_P[C'
    dirName = '/tmp'
    defaultUser = 'admin'
    defaultPwd = '123456'
}

module.exports = {
    REDIS_CONF,
    MQTT_CONF,
    jwtKey,
    dirName,
    defaultPwd,
    defaultUser
}
