## HOW TO COMPILE:

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

## HOW TO USE DOCKER:

- copy file .env-example ke .env file

```bash
cp .env-example .env
```

- menggunakan docker compose

```bash
docker compose up -d
```
