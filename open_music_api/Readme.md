## Open Music API

Open Music API untuk belajar fundamental backend

### Tech:

- NodeJS
- Hapi
- Redis
- RabbitMQ
- PostgreSQL

### How to compile:

- copy file .env-example ke .env file

```bash
cp .env-example .env
```

- sesuaikan environtment yang digunakan
- migrate database

```bash
npm run migrate up
```

- start server in dev mode

```bash
npm run start-dev
```
