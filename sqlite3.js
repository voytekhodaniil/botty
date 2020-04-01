const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});
exports.db = db;
db.run('CREATE TABLE IF NOT EXISTS CART(TelegramId int NOT NULL , MUKA int DEFAULT 0,SOLKA int DEFAULT 0,SAHAR int DEFAULT 0,MASK int DEFAULT 0,MARL int DEFAULT 0,GRECHA int DEFAULT 0)');
db.run('CREATE TABLE IF NOT EXISTS ORDERS(order_id INTEGER PRIMARY KEY,    TelegramId int NOT NULL , MUKA int DEFAULT 0,SOLKA int DEFAULT 0,SAHAR int DEFAULT 0,MASK int DEFAULT 0,MARL int DEFAULT 0,GRECHA int DEFAULT 0,PAYMENT int,STATUS int DEFAULT 0,ADRES int,orderSum int)');
