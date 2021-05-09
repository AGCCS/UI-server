## express-api-server for project AGCCS-CTRL22
This programm aims to develop the server and API-interface for the web-UI of project AGCCS-CTRL22, which is compield by the Vue-Program in the repository [monitor](https://github.com/AGCCS/monitor). In order to simplify the installation process and facilitate testing the performance of the server the performance of our server, the built web-UI is integrated in [./dist](./dist) and runs on port 8071. This repository is organised as follows:

The whole work is developed based on nodejs and uses express as the web framework. Now it contains the following 3 main functions:
* [./bin](./bin): Default file *www* from express, which determines the port of the API-interface 3000.
* [app.js](app.js): Default main executable file from express. The integration of web-UI, the sessionstorage of cookies, which uses redis for storage, the router, the mqtt server, which is implemented by [aedes](https://github.com/moscajs/aedes), and the heatbeat read task of mqtt.
* [./conf](./conf): Declaration of some important or frequently used configurations like configurations of redis and mqtt-client, default username and password.
* [./dist](./dist): The built web-UI as described above.
* [./logs](./logs): Log files such as error logs.
* [./public](./public): Path of the static file. Mainly it is used to store the firmware uploaded by the UI.
* [./component](./component): Components that implement all main functions.
> * [controller]([./component/controller): Implementation of basic operations related to router, database and mqtt.
> * [midware](./component/midware): Currently there is only middleware that verifies whether the user is the administrator.
> * [model](./component/model): Currently there is only message model that should be sent to the UI.
> * [routes](./component/routes): Router for the requests sent by the UI such as GET, POST and PUT.
> * [tool](./component/tool): Implementation of tools such as redis, mqtt and the database, sqlite3. 


1. Contact nodes with MQTT. This function is mainly compiled by pubcontrol.js, subcontrol.js and initcontrol.js. The needed mqtt server should be created by raspberry Pi with mosquitto (default adrress is 192.168.5.1 and port is 1884, which is defined in configuration.js in forlder 'conf').
2. Read data and information of node from the database or store data and imformation that is sent by nodes via mqtt.
3. Upload the firmware of ESP32 (which now is specific m5stick). The uploaded firmware will be stored in the folder 'public'. So in order to operate successfully, the parameter 'dirName' in the configuration.js(in folder 'conf') should be the same path of the folder 'public'. The ESP32 should be able send a http-get-request to the your ipadress:8071. 
4. Create subuser to check all the data and change the password of users. Subuser has no authority to operate.

### Guidelines for Installation

##### Development environment
```
nodejs v14.15.3
npm v6.14.10 (compatibility of lower version hasn't been tested)
redis v5.0.3
```

##### Project setup
```
npm install
```

##### Instruction for Redis
```
For raspberry Pi:
sudo nano /etc/redis/redis.conf
find "bind 127.0.0.1 ::1"
replace with "#bind 127.0.0.1 ::1"
sudo service redis-server restart
redis-server
```

##### Compiles for development
```
npm run dev
```
notes: There is always an error about getting /favicon.ico with raspberry Pi. I have eliminated it on windows system. But it is still there on rasbian. But it can be ignored.

##### Compiles for production
```
npm run prd
```
