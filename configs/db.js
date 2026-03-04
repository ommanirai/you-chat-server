const mongoose = require("mongoose");
const dbConfig = require("./db.config");

mongoose.connect(dbConfig.conxnUrl + "/" + dbConfig.dbName)
    .then(function (done) {
        console.log("db connection success");
    })
    .catch(function (err) {
        console.log('db connection fail, error in database connection:', err)
    })
