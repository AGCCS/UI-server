## express-api-server for project AGCCS-CTRL22
This programm aims to develop the server and API-interface for the web-UI of project AGCCS-CTRL22, which is compield by the Vue-Program in the repository [monitor](https://github.com/AGCCS/monitor). In order to simplify the installation process and facilitate testing the performance of the server the performance of our server, the built web-UI is integrated in [./dist](./dist) and runs on port 8071. This repository is organised as follows:

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

### Key Features

1. Establishment of mqtt service (see [aedesMqtt](./component/tool/aedesMqtt.js)) and its related applications of charging nodes (see [subControl](./component/controller/subControl.js) and [pubControl](./component/controller/pubControl.js)). The callback functions related to the actions of the mqtt-client like connection, disconnection and publication are encapsulated to meet possible future needs. Currently they have been tested but not applied to the program. The default adrress of mqtt-server is 192.168.5.1 and port is 1884, which is defined in [configuration](./conf/configuration.js)
2. Establishment of database (see [sqlite](./component/tool/sqlite.js)). Two functions *dataExec* and *queryData* are encapsulated to operate the database. The former is used to modify data. The latter is used to query data. 
3. Web-API and router to handle the request from web-UI. The API runs on port 3000. In the programm of web-UI it is defined as *baseURL 'http://192.168.5.1:3000/api/'*. There is 4 routers, *nodes*, *mesh*, *upload* and *users*. All the post and put requests except for login and password modification will be checked by the middleware *admincheck* in [adminCheck](./component/midware/adminCheck.js) to ensure that only the administrator has the authority to operate. All the subuser can only read the data of mesh and nodes.
4. Some basic requirements of web applications like *redis* and *logger* are integrated in the programm. But currently there are only related applications and no more development.

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
