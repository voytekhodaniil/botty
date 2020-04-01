const { NAMES, COST, ENDS } = require("./NAMES");
const { db } = require("./sqlite3");

function getAddr(ctx){
    if(ctx.match[0].length == 1)
         return ctx.match.split(':')[1];
    else return ctx.match[0].split(':')[1];
}
exports.getAddr = getAddr;

async function addStuff(ctx, key, question) {
    if (question === undefined || isNaN(parseInt(key)) || parseInt(key) <= 0)
        return;

    return await new Promise(function (resolve, reject) {
    db.get("SELECT MUKA, SOLKA, MARL, SAHAR, MASK,  GRECHA FROM CART WHERE TelegramId = " + ctx.from.id, [], (err, row) => {
        if (err) {
            reject( err);
        }
        if (row === undefined) {
            db.run(`INSERT INTO CART (TelegramId,${question}) VALUES(${ctx.from.id},${key})`, [], (err, rows) => {
                if (err) {
                    throw err;
                }
                resolve(0)
            });
        }
        else {
            db.run(`UPDATE CART SET ${question} = ${key}+(SELECT  ${question} FROM CART WHERE TelegramId = ${ctx.from.id}) WHERE TelegramId = ${ctx.from.id}`, [], (err, rows) => {
                if (err) {
                    throw err;
                }
                resolve(0)
            });
        }
    })})
}
exports.addStuff = addStuff;

async function getStuff(ctx, question) {
    if (question == undefined)
        return await new Promise(function (resolve, reject) { return "SERVERERROR"; });
    else
        return await new Promise(function (resolve, reject) {
        db.get(`SELECT  ${question} FROM CART WHERE TelegramId = ${ctx.from.id}`, [],async (err, rows) => {
            if (err)
                reject("Read error: " + err.message);
            else {
                if(rows!=undefined)
                    resolve(rows);
                else{await addStuff(ctx,0,question);var nwob = new Object;nwob[question]=0; resolve(nwob);}
            }
        });
    });
}
exports.getStuff = getStuff;
function removeStuff(ctx, question) {
    if (NAMES[question] == undefined)
        return "SERVERERROR";
    db.get(`UPDATE CART SET ${question} = 0 WHERE TelegramId = ${ctx.from.id}`, [], (err, rows) => {
        if (err)
            console.log(err);
    });
}
exports.removeStuff = removeStuff;

async function orderSum(ctx) {
    return new Promise(function (resolve, reject) {
        db.get(`SELECT  MUKA, SOLKA, MARL, SAHAR, MASK,  GRECHA FROM CART WHERE TelegramId = ${ctx.from.id}`, [], (err, rows) => {
            if (err)
                reject("Read error: " + err.message);
            else {
                var sum = 0;
                for (var prop in rows) {
                    sum += rows[prop] * COST[prop];
                }
                resolve(sum);
            }
        });
    });
}
exports.orderSum = orderSum;
async function generateCartName(ctx, key) {
    return getStuff(ctx, key).then(row => {
        if(row[key]==undefined)
            row[key]=0;
        return NAMES[key] + " : " + row[key] + " " + ENDS[key] + ", сумма - " + (row[key] * COST[key]).toFixed(2) + " гривен";
    });
}
exports.generateCartName = generateCartName;

async function getCartsProductSize(ctx, key) {
    return new Promise(function (resolve, reject) {
        db.get(`SELECT ${key} FROM CART WHERE TelegramId = ${ctx.from.id}`, [], (err, rows) => {
            if (err)
                reject("Read error: " + err.message);
            else {
                if(rows!=undefined)
                    resolve(rows[key]);
                else resolve(0)
            }
        });
    });
}
exports.getCartsProductSize = getCartsProductSize;

async function getCartsProductSizeMoreZero(ctx, key) {
    return getCartsProductSize(ctx, key).then((val) => { 
        return val <= 0; });
}
exports.getCartsProductSizeMoreZero = getCartsProductSizeMoreZero;

async function getCartsProductEDITING(ctx) {
    return generateCartName(ctx, getAddr(ctx));
}
exports.getCartsProductEDITING = getCartsProductEDITING;

