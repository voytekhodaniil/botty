const { getAddr } = require("./addStuff");
const { ENDS, EDITSUM } = require("./NAMES");
const { db } = require("./sqlite3");
function editplusstext(ctx) {
    var code = getAddr(ctx);
    return `+ ${EDITSUM[code]} ${ENDS[code]}`;
}
exports.editplusstext = editplusstext;
async function editminus(ctx) {
    var userid = ctx.from.id;
    var code = getAddr(ctx);
    return new Promise(function (resolve, reject) {
        db.get(`SELECT ${code} FROM CART WHERE TelegramId = ${ctx.from.id}`, [], (err, rows) => {
            if (err)
                reject("Read error: " + err.message);
            else {
                resolve(rows);
            }
        });
    }).then(async (row1) => {
        if (row1[code] ==undefined)
            return;
        if (row1[code] >= EDITSUM[code])
            db.run(`UPDATE CART SET ${code}=${row1[code] - EDITSUM[code]} WHERE TelegramId = ${userid}`);
        return;
    });
}
exports.editminus = editminus;
;
function editremove(ctx) {
    var userid = ctx.from.id;
    var code = getAddr(ctx);
    db.run(`UPDATE CART SET ${code}=0 WHERE TelegramId = ${userid}`);
}
exports.editremove = editremove;
;
function editplus(ctx) {
    var userid = ctx.from.id;
    var code = getAddr(ctx);
    db.run(`UPDATE CART SET ${code}=(SELECT ${code} FROM CART WHERE TelegramId = ${userid})+${EDITSUM[code]} WHERE TelegramId = ${userid}`);
}
exports.editplus = editplus;
;
function editminustext(ctx) {
    var code = getAddr(ctx);
    return `- ${EDITSUM[code]} ${ENDS[code]}`;
}
exports.editminustext = editminustext;
