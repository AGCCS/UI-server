# 1. API Interfaces Dokumentation for UI-server of AGCCS

## 1.1. API Interfaces Description

- Basic URL template：`http://127.0.0.1:3000/api/`
- The server has enabled CORS cross-domain support
- Authorization only with token
- APIs that require authorization must use the `Authorization` field in the request header to provide a `token`
- Use HTTP Status Code to identify status
- Return data in JSON format

### 1.1.1. Supported Request Method

- GET（SELECT）：request data.
- POST（CREATE）：Create new resource。
- PUT（UPDATE）：Update the resource。
- DELETE（DELETE）：Delete the resource.

### 1.1.2. General Response Status description

| *Status Code* | *Meaning*                | *Comment*                                              |
| -------- | --------------------- | --------------------------------------------------- |
| 200      | OK                    | Request succeeded                              |
| 201      | CREATED               | Successfully Created                           |
| 204      | DELETED               | Successfully deleted                           |
| 400      | BAD REQUEST           | Wrong Parameters                               |
| 401      | UNAUTHORIZED          | Unauthorized                                   |
| 403      | FORBIDDEN             | Access is forbidden                            |
| 404      | NOT FOUND             | The requested resource does not exist          |
| 404      | NOT FOUND             | Resource cannot support the request            |
| 500      | INTERNAL SERVER ERROR | Unexpected Error happened in the server        |

------

## 1.2. Users

### 1.2.1. Interface for login authentication

- Request url：users/login
- Method：post
- Request Parameters:

| Parameter| Description | Type | Comment  |
| -------- | --------      |-------- | -------- |
| username |               | String | Not null |
| password |               | String | Not null |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    |--------| --------------- |
| username |                | String |                |
| password |                | String | Return as meaningless content|
| token    |                | String | jsonwebtoken |

- Successful Response

```json
{
    "data": {
        "username": "admin1",
        "password": "****",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMSIsImlhdCI6MTYyMzY3ODQ1NywiZXhwIjoxNjI3Mjc4NDU3fQ.wrO3YGmbg9zLwIP8KjIWhng3DowDmWWjJKqoFBWLxaQ"
    },
    "meta": {
        "msg": "login successful",
        "status": 200
    },
    "errno": 0
}
```

### 1.2.2. Interface for Password Change

- Request url：users/password
- Method：post
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------       |-------- | -------- |
| username |                | String |Not null |
| password |                | String |Not null |
| newPassword |             | String |Not null |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "successfully change password",
        "status": 202
    },
    "errno": 0
}
```

### 1.2.1. Interface for Add Subuser

- Request url：users/addUser
- Method：post
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------       | -------- | -------- |
| subUsername | Username of subuser | String | Not null |
| subPassword | Password of subuser | String | Not null |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | ----------- |  -------- |--------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "successfully added the new user",
        "status": 202
    },
    "errno": 0
}
```

## 1.3. Mesh

### 1.3.1. Query Settings of Mesh

- Request url：mesh/setting
- Method：get
- Request Parameters:

| Parameter| Description | Type | Comment |
| -------- | --------   |-------- | -------- |
|  |  |  |  |

- Response data:

| Parameter   | Description | Type | Comment |
| -------- | -----------    |-------- | --------------- |
| id       | id of mesh setting | Number | Kept for possible setting template in the future |
| wholeMax | Maximum current in each phase of the entire charging station | Number |  |
| manUsedCur1 | Current consumed by nodes in manual mode in phase 1 | Number | Not shown, but kept |
| manUsedCur2 | Current consumed by nodes in manual mode in phase 2 | Number | Not shown, but kept |
| manUsedCur3 | Current consumed by nodes in manual mode in phase 3 | Number | Not shown, but kept |
| manTotalCur1 | Current allocated to nodes in manual mode in phase 1 | Number | Not shown, but kept |
| manTotalCur2 | Current allocated to nodes in manual mode in phase 2 | Number | Not shown, but kept |
| manTotalCur3 | Current allocated to nodes in manual mode in phase 3 | Number | Not shown, but kept |

- Successful example

```json
{
    "data": {
        "id": 1,
        "wholeMax": 100,
        "manUsedCur1": 0,
        "manUsedCur2": 0,
        "manUsedCur3": 0,
        "manTotalCur1": 0,
        "manTotalCur2": 0,
        "manTotalCur3": 0
    },
    "meta": {
        "msg": "successfully get the setting of mesh",
        "status": 200
    },
    "errno": 0
}
```

### 1.3.2. Change Settings of Mesh

- Request url：mesh/setting
- Method：put
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | -------- | -------- | -------- |
|  |  |  |  |
- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | ----------- | -------- | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "successfully change the setting of mesh",
        "status": 202
    },
    "errno": 0
}
```

### 1.3.3. Mesh Data Initialization

- Request url：mesh/init
- Method：delete
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------       | -------- |
|  |  |  |  |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "successfully initialized the mesh",
        "status": 202
    },
    "errno": 0
}
```

## 1.4. Nodes

### 1.4.1. Query Information List of Nodes

- Request url：nodes/list
- Method：get
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
|  |  |  |  |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
| id       | Id of  nodes           | Number   |           |
| nodeName | Name of  nodes         | String    | Default is null |
| macADR   | Mac address of  nodes  | String    | Mac address not separated by colon |
| connect  | Connection of  nodes   | Boolean   | 0 for no connection |
| Parent   | Mac adress of their parent node | String |  |
| Rssi | Received signal strength indication | Number |  |
| Layer | Layer in the mesh         | Number    |  |
| Plat | Number in the layer        | Number    |  |
| Version | Version of firmware demesh       | String |  |
| Board| Development board of nodes | String |  |
| avrVer | Version of firmware ctrl22c       | String |  |

- Successful example

```json
{
    "data": [
        {
            "id": 3,
            "nodeName": null,
            "macADR": "d8a01d56c044",
            "connect": 0,
            "Parent": "b8:27:eb:96:aa:3e",
            "Rssi": -67,
            "Layer": 1,
            "Plat": 0,
            "Version": "1.4",
            "Board": "m5stick",
            "avrVer": "0"
        },
        {
            "id": 4,
            "nodeName": null,
            "macADR": "d8a01d56c3f8",
            "connect": 0,
            "Parent": "d8:a0:1d:56:c0:45",
            "Rssi": -52,
            "Layer": 2,
            "Plat": 50,
            "Version": "1.4",
            "Board": "m5stick",
            "avrVer": "0"
        },
        {
            "id": 5,
            "nodeName": null,
            "macADR": "d8a01d56b864",
            "connect": 0,
            "Parent": "d8:a0:1d:56:c0:45",
            "Rssi": -37,
            "Layer": 2,
            "Plat": 49,
            "Version": "1.8",
            "Board": "m5stick",
            "avrVer": "0"
        }
    ],
    "meta": {
        "msg": "successfully get the list of nodes",
        "status": 200
    },
    "errno": 0
}
```

### 1.4.2. Query Information of one Particular Node

- Request url：nodes/list
- Method：get
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------       | -------- |
| id | Id of the node being queried | Id in the form of url query |

- Response data:

| Parameter   | Description | Type      |  Comment     |
| -------- | -----------    | --------- |--------------- |
| id       | Id of  the node           | Number   |           |
| nodeName | Name of  the node         | String    | Default is null |
| macADR   | Mac address of  the node  | String    | Mac address not separated by colon |
| connect  | Connection of  the node   | Boolean   | 0 for no connection |
| Parent   | Mac adress of their parent node | String |  |
| Rssi | Received signal strength indication | Number |  |
| Layer | Layer in the mesh         | Number    |  |
| Plat | Number in the layer        | Number    |  |
| Version | Version of firmware demesh       | String |  |
| Board| Development board of the node | String |  |
| avrVer | Version of firmware ctrl22c       | String |  |

- Successful example

```json
{
    "data": {
        "id": 3,
        "nodeName": null,
        "macADR": "d8a01d56c044",
        "connect": 0,
        "Parent": "b8:27:eb:96:aa:3e",
        "Rssi": -67,
        "Layer": 1,
        "Plat": 0,
        "Version": "1.4",
        "Board": "m5stick",
        "avrVer": "0"
    },
    "meta": {
        "msg": "successfully get the information of node with id = 3.",
        "status": 200
    },
    "errno": 0
}
```

### 1.4.3. Query Working Status of Nodes

- Request url：nodes/status
- Method：get
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
|  |  |  |  |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
| id | Id of nodes               | Number |   |
| macADR | Mac address of nodes  | String | Mac address not separated by colon |
| connect | Connection of nodes  | Boolean | Boolean, 0 for no connection |
| Cur1 | Current value in phase 1   | Number |   |
| Cur2 | Current value in phase 2   | Number |   |
| Cur3 | Current value in phase 3   | Number |   |
| workStatus | CCSS of nodes        | Number |   |
| sPhases | Version of firmware demesh  | Number |   |
| smaxCur| Development board of the node | Number |   |
| workmode | Working mode of nodes | String | Default is auto  |
| maxCur | Maximum Current of nodes | Number |   |
| Phases| Phases occupied by nodes | Number |   |
| cmaxCur | Cable capacity      | Number |   |
| nodeName | Name of the node   | String | Default is null |

- Successful example

```json
{
    "data": [
        {
            "id": 3,
            "macADR": "d8a01d56c044",
            "connect": 0,
            "Cur1": 0,
            "Cur2": 0,
            "Cur3": 0,
            "workStatus": 0,
            "sPhases": 0,
            "smaxCur": 0,
            "workmode": "auto",
            "maxCur": 0,
            "Phases": 0,
            "cmaxCur": 0,
            "nodeName": null
        },
        {
            "id": 4,
            "macADR": "d8a01d56c3f8",
            "connect": 0,
            "Cur1": 0,
            "Cur2": 0,
            "Cur3": 0,
            "workStatus": 0,
            "sPhases": 0,
            "smaxCur": 0,
            "workmode": "auto",
            "maxCur": 0,
            "Phases": 0,
            "cmaxCur": 0,
            "nodeName": null
        },
        {
            "id": 5,
            "macADR": "d8a01d56b864",
            "connect": 0,
            "Cur1": 0,
            "Cur2": 0,
            "Cur3": 0,
            "workStatus": 0,
            "sPhases": 0,
            "smaxCur": 0,
            "workmode": "auto",
            "maxCur": 0,
            "Phases": 0,
            "cmaxCur": 0,
            "nodeName": null
        }
    ],
    "meta": {
        "msg": "successfully get the status of nodes",
        "status": 200
    },
    "errno": 0
}
```

### 1.4.4. Query Working Status of one Paticular Node

- Request url：nodes/status
- Method：get
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
| id | Id of the node being queried | Number | Sent in the form of url query |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
| id | Id of the node               | Number |   |
| macADR | Mac address of the node  | String | Mac address not separated by colon |
| connect | Connection of the node  | Boolean | Boolean, 0 for no connection |
| Cur1 | Current value in phase 1   | Number |   |
| Cur2 | Current value in phase 2   | Number |   |
| Cur3 | Current value in phase 3   | Number |   |
| workStatus | CCSS of the node        | Number |   |
| sPhases | Version of firmware demesh  | Number |   |
| smaxCur| Development board of the node | Number |   |
| workmode | Working mode of the node | String | Default is auto  |
| maxCur | Maximum Current of the node | Number |   |
| Phases| Phases occupied by the node | Number |   |
| cmaxCur | Cable capacity      | Number |   |
| nodeName | Name of the node   | String | Default is null |

- Successful example

```json
{
    "data": {
        "id": 3,
        "macADR": "d8a01d56c044",
        "connect": 0,
        "Cur1": 0,
        "Cur2": 0,
        "Cur3": 0,
        "workStatus": 0,
        "sPhases": 0,
        "smaxCur": 0,
        "workmode": "auto",
        "maxCur": 0,
        "Phases": 0,
        "cmaxCur": 0,
        "nodeName": null
    },
    "meta": {
        "msg": "successfully get the status of node with id = 3.",
        "status": 200
    },
    "errno": 0
}
```

### 1.4.6. Operation Button of one Paticular Node

- Request url：nodes/buttonB
- Method：put
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
|  |  |  |  |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "successfully pressed the operation button remotely",
        "status": 200
    },
    "errno": 0
}
```

### 1.4.7. Blink one Paticular Node

- Request url：nodes/Blink
- Method：put
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
|  |  |  |  |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "successfully blink the node remotely",
        "status": 200
    },
    "errno": 0
}
```

### 1.4.8. Stop Blinking 

- Request url：nodes/noBlink
- Method：put
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
|  |  |  |  |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "successfully stop the node from blinking remotely",
        "status": 200
    },
    "errno": 0
}
```

## 1.5. Upload

### 1.5.1. File Upload

- Request url：upload/
- Method：post
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
| File | File of the uploaded firmware | Image | If file is for ESP32, care of its filename |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "File demesh_m5stick_1_4.bin uploaded successfully",
        "status": 201
    },
    "errno": 0
}
```
### 1.5.2. ESP32 Firmware Upload

- Request url：upload/ESP32
- Method：post
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
| Board | Name of the firmware | String |  |
| Version | Version of the uploaded firmware | String |  |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "ESP32 will download the Firmaware 'demesh' v1.4 now.",
        "status": 201
    },
    "errno": 0
}
```

### 1.5.3. AVR Firmware Upload

- Request url：upload/AVR
- Method：post
- Request Parameters:

| Parameter| Description | Type |  Comment  |
| -------- | --------    | -------- | -------- |
| fileName | Name of the file| String |  |
| macADR | Mac address of the node | String | Mac address not separated by colon |
| macAddr | Mac address of the node | String | Mac address separated by colon |

- Response data:

| Parameter   | Description | Type |  Comment     |
| -------- | -----------    | -------- | --------------- |
|  |  |  |  |

- Successful example

```json
{
    "meta": {
        "msg": "Node d8a01d56c044 will download the Firmaware ctrl22c.bin now.",
        "status": 201
    },
    "errno": 0
}
```
