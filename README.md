## express-api-server for project AGCCS-CTRL22
This programm aims to develop the server and API-interface for the user interface of project AGCCS-CTRL22. It also contains the compiled user interface, which is running on port 80.

### Guidelines for Installation

##### Development environment
```
nodejs v14.15.3
npm v6.14.10 (compatibility of lower version hasn't been tested)
mysql v8.0.22(at least v5.5.53) or MariaDB v10.0.28 (for rasbian) 
redis v5.0.3
```

##### Project setup
```
npm install
npm install --save-dev cross-env
npm install --save-dev nodemon
npm install --save-dev pm2
```
##### Instruction for source the database
```
mysql -uroot -proot 
(default user and password, which can be changed in configuration.js in folder 'conf')

Command for MariaDB:
use mysql;
update user set authentication_string=password('root'),plugin='mysql_native_password' where user='root';
create database loadstaion;
use loadstaion;
source XXX/conf/loadstaion.sql; (replace XXX with proper path)

Command for mysql:
alter user 'root'@'localhost' identified with mysql_native_password by '123456';
create database loadstaion;
use loadstaion;
source XXX/conf/loadstaion.sql; (replace XXX with proper path)

```

##### Compiles for development
```
npm run dev
```

##### Compiles for production
```
npm run prd
```
