'use strict';

const Sequelize = require('sequelize');
const Pbkdf2 = require('nodejs-pbkdf2');

const Log = require('./lib/infra/logger');
const Server = require('./lib/servers/server');
const Database = require('./lib/database/database');
const UserModel = require('./lib/modules/user/model/user');
const UserHandler = require('./lib/modules/user/handler/handler');
const Key = require('./lib/shared/key');

// load env
require('dotenv').config();

// set default PORT
const PORT = process.env.PORT || 9000;

const dbConfig = {
    dbName: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

// create database instance
const db = new Database(dbConfig);

// check database connection
db.connection.authenticate()
.then(() => {
    Log.i('Connection has been established successfully.');
})
.catch(err => {
    Log.e('Unable to connect to the database:');
    process.exit(1);
});


// Note:
// please comment this code when running in production
db.connection.sync({ force: true })
.then(() => {
      Log.i(`Database & tables created!`);
});

// load private key
const privateKEY = Key.getKeySync('../../config/app.rsa');
// load public key
const publicKEY = Key.getKeySync('../../config/app.rsa.pub');

// set jwt options
const jwtOptions = {
    issuer: "piyelek.github.io",
    audience: process.env.JWT_AUD_KEY,
    expired: process.env.ACCESS_TOKEN_EXPIRED
};

// set jwt verify options
const jwtVerifyOptions = {
    algorithms: ['RS256'],
    audience: process.env.JWT_AUD_KEY,
    issuer: 'piyelek.github.io',
    clockTolerance: 5
};

//password hasher
const config = {
    digestAlgorithm: 'sha1',
    keyLen: 64,
    saltSize: 64,
    iterations: 1000
  };
  
let pbkdf2 = new Pbkdf2(config);

const userModel = UserModel(db.connection, Sequelize);
const userHandler = UserHandler(userModel, privateKEY, publicKEY, jwtVerifyOptions, jwtOptions, pbkdf2);

const handlers = {
    userHandler: userHandler
};

// SERVER
// create server instance
const server = new Server(handlers);

// listen server
server.app.listen(PORT, err => {
    if (err) {
        Log.e(`error on startup ${err}`);
    } else {
        Log.i(`server running on port ${PORT}`);
    }
});