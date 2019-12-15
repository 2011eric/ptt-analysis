# ptt-analysis

## Set up app

Client web
```
cd web/cli
yarn install
# Change api url in src/components/Page.vue
yarn build
```

Api side
```
cd web/srv
yarn install
# Change prot in app.js and add data.db file
node app.js
```

# Database
using sqlite3

`post` table

|id|title|link|board|author|content|timestamp|
|---|---|---|---|---|---|---|
|INT AI KEY|TEXT|TEXT|TEXT|TEXT|TEXT|INT|

`comments` table

|id|article|tag|user|text|ip|timestamp|
|---|---|---|---|---|---|---|
|INT AI KEY|INT|TEXT|TEXT|TEXT|TEXT|INT|

# Documents

[lodash](https://lodash.com/docs/)

[vuejs](https://vuejs.org/v2/api/)

[vuetify](https://vuetifyjs.com/en/getting-started/quick-start/)
