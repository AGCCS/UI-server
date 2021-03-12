const env = process.env.NODE_ENV // environment parameter

let MYSQL_CONF
let REDIS_CONF

if (env === 'dev') {
    MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: 'root',
        port: '3306',
        database: 'loadstation'
    }

    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
    
    MQTT_CONF = 'mqtt:192.168.2.109:1884'
}

if (env === 'production') {
    MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: 'root',
        port: '3306',
        database: 'loadstation'
    }

    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }

    MQTT_CONF = 'mqtt:192.168.2.109:1884'
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF,
    MQTT_CONF
}
