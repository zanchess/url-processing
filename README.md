## Description
Distributed request


## Installation
### Install PostgreSQL and Redis containers
```bash
$ docker-compose up -d
```

### Install dependencies
```bash
$ yarn install
```

### Set prisma value
```bash
$ prisma generate
```

### Start migrations
```bash
$ prisma migrate deploy
```

### Running the app
```bash
# watch mode
$ yarn run start:dev
```

### Database credentials:
- host: localhost
- database: processing-db
- user: postgres
- password: password

### BullMQ Dashboard
[Dashboard Host](http://localhost:3008/admin/queues)

BullMQ Dashboard Credentials:
- user: user
- password: password

### Request curl
curl --location --request POST 'http://localhost:3005/api/url-processing/sendRequests' \
--header 'X-API-Key: {{token}}'

### High level diagram
![Снимок экрана 2025-02-24 в 09.45.19.png](files/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202025-02-24%20%D0%B2%2009.45.19.png)
