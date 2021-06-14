# 1. API Interfaces Dokumentation for UI-server of AGCCS

## 1.1. API Interfaces Description

- Basic URL template：`http://127.0.0.1:3000/api/`
- The server has enabled CORS cross-domain support
- Authorization only with token
- APIs that require authorization must use the `Authorization` field in the request header to provide a `token`
- Use HTTP Status Code to identify status
- Return data in JSON format

### 1.1.1. Supported Request Method

- GET（SELECT）：从服务器取出资源（一项或多项）。
- POST（CREATE）：在服务器新建一个资源。
- PUT（UPDATE）：在服务器更新资源（客户端提供改变后的完整资源）。
- PATCH（UPDATE）：在服务器更新资源（客户端提供改变的属性）。
- DELETE（DELETE）：从服务器删除资源。
- HEAD：获取资源的元数据。
- OPTIONS：获取信息，关于资源的哪些属性是客户端可以改变的。

### 1.1.2. General Response Status description

| *Status Code* | *Meaning*                | *Comment*                                              |
| -------- | --------------------- | --------------------------------------------------- |
| 200      | OK                    | 请求成功                                            |
| 201      | CREATED               | 创建成功                                            |
| 204      | DELETED               | 删除成功                                            |
| 400      | BAD REQUEST           | 请求的地址不存在或者包含不支持的参数                |
| 401      | UNAUTHORIZED          | 未授权                                              |
| 403      | FORBIDDEN             | 被禁止访问                                          |
| 404      | NOT FOUND             | 请求的资源不存在                                    |
| 422      | Unprocesable entity   | [POST/PUT/PATCH] 当创建一个对象时，发生一个验证错误 |
| 500      | INTERNAL SERVER ERROR | 内部错误                                            |
|          |                       |                                                     |

------

## 1.2. Users

### 1.2.1. Interface for login authentication

- Request url：users/login
- Method：post
- Request Parameters:

| Parameter| Description | Comment  |
| -------- | --------       | -------- |
| username |                | Not null |
| password |                | Not null |

- Response data:

| Parameter   | Description | Comment     |
| -------- | -----------    | --------------- |
| username |                |                 |
| password |                | Return as meaningless content|
| token    |                | jsonwebtoken |

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

| Parameter| Description | Comment  |
| -------- | --------       | -------- |
| username |                | Not null |
| password |                | Not null |
| newPassword |               | Not null |

- Response data:

| Parameter   | Description | Comment     |
| -------- | -----------    | --------------- |
| |                |                 |

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

| Parameter| Description | Comment  |
| -------- | --------       | -------- |
| subUsername | Username of subuser             | Not null |
| subPassword | Password of subuser               | Not null |

- Response data:

| Parameter   | Description | Comment     |
| -------- | -----------    | --------------- |
| |                |                 |

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

| Parameter| Description | Comment  |
| -------- | --------       | -------- |
|  |           |  |

- Response data:

| Parameter   | Description | Comment     |
| -------- | -----------    | --------------- |
| id | id of mesh setting | Kept for possible setting template in the future |
| wholeMax | Maximum current in each phase of the entire charging station | |
| manUsedCur1 | Current consumed by nodes in manual mode in phase 1 | Not shown, but kept |
| manUsedCur2 | Current consumed by nodes in manual mode in phase 2 | Not shown, but kept |
| manUsedCur3 | Current consumed by nodes in manual mode in phase 3 | Not shown, but kept |
| manTotalCur1 | Current allocated to nodes in manual mode in phase 1 | Not shown, but kept |
| manTotalCur2 | Current allocated to nodes in manual mode in phase 2  | Not shown, but kept |
| manTotalCur3 | Current allocated to nodes in manual mode in phase 3  | Not shown, but kept |

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

| Parameter| Description | Comment  |
| -------- | --------       | -------- |
|  |           |  |

- Response data:

| Parameter   | Description | Comment     |
| -------- | -----------    | --------------- |

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

| Parameter| Description | Comment  |
| -------- | --------       | -------- |
|  |           |  |

- Response data:

| Parameter   | Description | Comment     |
| -------- | -----------    | --------------- |
|  |           |  |

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

| Parameter| Description | Comment  |
| -------- | --------       | -------- |
|  |           |  |

- Response data:

| Parameter   | Description | Comment     |
| -------- | -----------    | --------------- |

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