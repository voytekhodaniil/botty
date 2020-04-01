const { editminustext, editminus, editremove, editplusstext, editplus } = require("./editplusstext");

const { getCartsProductEDITING, getStuff, orderSum,addStuff,removeStuff,generateCartName,getCartsProductSizeMoreZero,getCartsProductSize} = require("./addStuff");
const { NAMES, COST, ENDS, ORDERSTATUS,ADRESSES} = require("./NAMES");
const { db } = require("./sqlite3");

var convert = require('xml-js');
var LiqPay = require('./liqpay');
var liqpay = new LiqPay("sandbox_i32316975721", "sandbox_sPLIP7W2LZOnxYW4Uq3ZUV3xMrFeZci5UiK6KvPu");
const Telegraf = require('telegraf');
const bot = new Telegraf("850893307:AAEFw8Y0dOdr5B7iW4nNDXKxnUAwvNilBPg");
const TelegrafInlineMenu = require('telegraf-inline-menu');
const LocalSession = require('telegraf-session-local');
bot.use((new LocalSession({ database: 'example_db.json' })).middleware())


async function checkpay(ctx){
    var thisrow = await orderlistbutton(ctx);

    var answ  = await new Promise(function (resolve, reject) {
        liqpay.api("request", {
            "action"   : "status",
            "version"  : "3",
            "order_id" : thisrow.order_id
            }, function( json ){
             resolve(json) ;
            });
    });

    console.log(answ);
    if(answ.status == 'success'){
        await new Promise(function (resolve, reject) {
            db.get(`UPDATE ORDERS SET STATUS=2,PAYMENT=${answ.payment_id} WHERE order_id = ${thisrow.order_id} AND TelegramId = ${ctx.from.id}`, [], (err, rows) => { ///////////////////////////////////////////////////
                if (err)
                    reject("Read error: " + err.message);
                    resolve("ok");            
            });
        });
        console.log("Order paid",answ.payment_id,ctx.from.id);
    }


  }


const main = new TelegrafInlineMenu(ctx => 'Выбор товаров');
const shop = new TelegrafInlineMenu(ctx => 'Магазин');
const shoppingcart = new TelegrafInlineMenu(ctx => 'Корзина');
const orders = new TelegrafInlineMenu(ctx => 'Ваши заказы');
const orderInfo = new TelegrafInlineMenu((ctx) => {checkpay(ctx); return 'ЗАКАЗ'});


const FAQ = new TelegrafInlineMenu(ctx => 'Часто задаваемие вопросы');
const chat = new TelegrafInlineMenu(ctx => 'Напишите нам');
const edit = new TelegrafInlineMenu(ctx =>'Измените кол-во товара' );


main.setCommand('start');

main.submenu("Выбор товаров", "toShop", shop);           //shop.submenu("<-","back",chat);
main.submenu("Корзина", "toShopcrt", shoppingcart);       //shoppingcart.submenu("<-","back",main);
main.submenu("Ваши заказы", "toORDERS", orders); 
main.submenu("Часто задаваемие вопросы", "toFAQ", FAQ);   //FAQ.submenu("<-","back",main);
main.submenu("Напишите нам", "toChat", chat);             //chat.submenu("<-","back",main);

for (var [code, name] of Object.entries(NAMES)) {

    var contextof = new Object();
    contextof.uniqueIdentifier = `${code}`;
    contextof.questionText = `Кол-во ${ENDS[code]}`;
    eval(`var func = function(ctx, key){addStuff(ctx,key,"${code}")}`);
    contextof.setFunc = func;
    shop.question(`Купить ${name}, цена ${COST[code]} грн/${ENDS[code]}`, `${code}`, contextof);
}


for (var [code, name] of Object.entries(NAMES)) {
    var contextof = new Object();
    eval(`var func = async(ctx)=>{return generateCartName(ctx,"${code}")}`);
    eval(`var hd = async(ctx)=>{return getCartsProductSizeMoreZero(ctx,"${code}")}`);

    shoppingcart.submenu(func, `${code}`, edit,{hide:hd});
}

edit.button(getCartsProductEDITING,'info',{doFunc:(ctx)=>{}});
edit.button(editminustext,'minus',{doFunc:editminus});
edit.button("Удалить",'remove',{doFunc:editremove,joinLastRow:1});
edit.button(editplusstext,'plus',{doFunc:editplus,joinLastRow:1});


async function createOrder(ctx){
    var rows = await getStuff(ctx,"MUKA, SOLKA, MARL, SAHAR, MASK,  GRECHA");
    console.log(rows);
    await db.run(`INSERT INTO ORDERS(        MUKA, SOLKA, MARL, SAHAR, MASK,  GRECHA, TelegramId,orderSum) SELECT CART.MUKA, CART.SOLKA, CART.MARL, CART.SAHAR, CART.MASK,  CART.GRECHA, CART.TelegramId,${await orderSum(ctx)} FROM CART WHERE TelegramId = ${ctx.from.id}`);

    ctx.answerCbQuery("Заказ сформирован. Перейдите в 'Ваши заказы'");

}
shoppingcart.button( (ctx) => {return orderSum(ctx).then((answ)=>{return "Оформить заказ, вместе " +answ+" грн";})},'END',{doFunc:createOrder});

async function totalorderspages(ctx){

    var rows = await new Promise(function (resolve, reject) {
        db.all(`SELECT ORDERS.order_id,ORDERS.orderSum FROM ORDERS WHERE TelegramId = ${ctx.from.id}`, [], (err, rows) => {
            if (err)
                reject("Read error: " + err.message);
            else {
                resolve(rows);
            }
        });
    });
    console.log(rows)
    return Math.ceil(rows.length/5);


}

 async function ordertext(ctx,key){
    var row = await new Promise(function (resolve, reject) {
        db.all(`SELECT ORDERS.order_id,ORDERS.orderSum FROM ORDERS WHERE TelegramId = ${ctx.from.id} ORDER BY order_id DESC `, [], (err, rows) => {
            if (err)
                reject("Read error: " + err.message);
            else {
                resolve(rows);
            }
        });
    });
    var thisrow = row[(ctx.session.page-1)*5+Number.parseInt(key)-1];
    console.log((ctx.session.page-1)*5+Number.parseInt(key));
    if(thisrow!=undefined)
        return "Заказ №"+thisrow.order_id+". Сумма - "+thisrow.orderSum+"грн";
    else return "erpr";
}

async function orderhide(ctx,key){

    var rows = await new Promise(function (resolve, reject) {
        db.all(`SELECT ORDERS.order_id,ORDERS.orderSum FROM ORDERS WHERE TelegramId = ${ctx.from.id} ORDER BY order_id DESC`, [], (err, rows) => {
            if (err)
                reject("Read error: " + err.message);
            else {
                resolve(rows);
            }
        });
    });


    if(rows[(ctx.session.page-1)*5+Number.parseInt(key)-1]!=undefined)
        return false;
    else return true;

}


for (var a =1;a<6;++a) {
    var contextof = new Object();
    eval(`var funca = function(ctx){return ordertext(ctx,${a})}`);
    eval(`var hida = function(ctx){return orderhide(ctx,${a})}`)

    orders.submenu(funca,`${a}`,orderInfo,{hide:hida});

}

orders.pagination('page', {

    setPage: (ctx, page) => {
        console.log(ctx,page);
        ctx.session.page = page;
    },
    getTotalPages: totalorderspages,
    getCurrentPage: ctx => ctx.session.page
  });
  function contextbutton(ctx){
      if(ctx.match!=undefined)
      return ctx.match[0].split(':')[1]||ctx.match.split(':')[1]
  }

  async function orderlistbutton(ctx){
    var row = await new Promise(function (resolve, reject) {
        db.all(`SELECT order_id , TelegramId , MUKA,SOLKA,SAHAR,MASK,MARL,GRECHA,PAYMENT,STATUS,ADRES,orderSum  FROM ORDERS WHERE TelegramId = ${ctx.from.id} ORDER BY order_id DESC`, [], (err, rows) => {
            if (err)
                reject("Read error: " + err.message);
            else {
                resolve(rows);
            }
        });
    });

    var thisrow = row[(ctx.session.page-1)*5+Number.parseInt(contextbutton(ctx))-1];
    return thisrow
}


  async function buttonInfo(ctx){
    var thisrow = await orderlistbutton(ctx);
    console.log(thisrow)
    if(thisrow!=undefined)
        return "Заказ №"+thisrow.order_id+". Сумма - "+thisrow.orderSum+"грн";
     else return "Удалено";

  }
  async function getORDERSTATUS(ctx){
    var thisrow = await orderlistbutton(ctx);
    if(thisrow!=undefined)
    return thisrow.STATUS;
  }
  async function buttonstatus(ctx){

    var thisrow = await getORDERSTATUS(ctx);
        return "Статус заказа : " +ORDERSTATUS[thisrow+1];

  }


    async function removebuttonaction(ctx){
        var thisrow = await orderlistbutton(ctx);
         await new Promise(function (resolve, reject) {
            db.all(`DELETE FROM ORDERS WHERE order_id = ${ thisrow.order_id}`, [], (err, rows) => { ///////////////////////////////////////////////////
                if (err)
                    reject("Read error: " + err.message);
                    console.log(rows);
                
            });
        });

  }


  async function setadress(ctx,key){
    var thisrow = await orderlistbutton(ctx);
    var adrcode = ADRESSES.indexOf(key);
    await new Promise(function (resolve, reject) {
        db.get(`UPDATE ORDERS SET ADRES=${adrcode},STATUS=1 WHERE order_id = ${thisrow.order_id} AND TelegramId = ${ctx.from.id}`, [], (err, rows) => { ///////////////////////////////////////////////////
            if (err)
                reject("Read error: " + err.message);
                resolve("ok");            
        });
    });
  }
  async function adressorder(ctx){
    var thisrow = await orderlistbutton(ctx);
    return "Район доставки: "+ADRESSES[thisrow.ADRES]
  }
  const deleted = new TelegrafInlineMenu((ctx) =>{removebuttonaction(ctx);return 'Ваш заказ удален'} );
  const statusedit = new TelegrafInlineMenu((ctx) =>{return ' заказ '} );

  orderInfo.button(buttonInfo,'info',{doFunc:(ctx)=>{}});
  orderInfo.submenu(buttonstatus, "deleted", statusedit);
  orderInfo.button(adressorder,'adress',{doFunc:(ctx)=>{},hide:async function(ctx){return (await getORDERSTATUS(ctx))==0;}});

  orderInfo.selectSubmenu('delete',["Удалить заказ"],deleted,{hide:async function(ctx){return (await getORDERSTATUS(ctx))!=0;}});
  
  statusedit.select('adress',ADRESSES,{setFunc:setadress,columns:2,hide:async function(ctx){return (await getORDERSTATUS(ctx))!=0;}})
  async function paymenturl(ctx){
    var thisrow = await orderlistbutton(ctx);
    
        var html = liqpay.cnb_form({
        'action'         : 'pay',
        'amount'         : thisrow.orderSum,
        'currency'       : 'UAH',
        'description'    : 'Оплата заказа в телеграм боте',
        'order_id'       : thisrow.order_id,
        'version'        : '3'
        });



    var result = JSON.parse(convert.xml2json(html, {compact: true, spaces: 4}));
    return result.form._attributes.action+"?data="+result.form.input[0]._attributes.value+"&signature="+result.form.input[1]._attributes.value;
  }

  statusedit.urlButton("Оплатить",paymenturl,{hide:async function(ctx){return (await getORDERSTATUS(ctx))!=1;}});
  statusedit.button("Проверить платеж",'check',{hide:async function(ctx){return (await getORDERSTATUS(ctx))!=1;},doFunc:checkpay});

bot.use(main.init({
    backButtonText: 'назад',
    mainMenuButtonText: 'В главное меню'
}));


bot.startPolling();
