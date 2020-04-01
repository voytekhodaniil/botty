const ORDERSTATUS = {
    '1':"Ожидание адреса доставки",
    '2': 'Ожидает оплаты',
    '3': 'Формируется',
    '4': 'Закладывается',
    '5': 'Заложено',
    '6': 'Получено'
};
exports.ORDERSTATUS = ORDERSTATUS;

const NAMES = {
    'MUKA': 'Мука',
    'SOLKA': 'Соль',
    'SAHAR': 'Сахар',
    'MASK': 'Маска',
    'MARL': 'Марля',
    'GRECHA': 'Греча'
};
exports.NAMES = NAMES;
const ENDS = {
    'MUKA': 'грамм',
    'SOLKA': 'грамм',
    'SAHAR': 'грамм',
    'MASK': 'штук',
    'MARL': 'пачек ',
    'GRECHA': 'грамм'
};
exports.ENDS = ENDS;
const EDITSUM = {
    'MUKA': 100,
    'SOLKA': 100,
    'SAHAR': 100,
    'MASK': 1,
    'MARL': 1,
    'GRECHA': 100
};
exports.EDITSUM = EDITSUM;
const COST = {
    'MUKA': 0.03,
    'SOLKA': 0.01,
    'SAHAR': 0.02,
    'MASK': 12,
    'MARL': 5,
    'GRECHA': 0.02
};
exports.COST = COST;
const ADRESSES = ["Голосеевский","Святошинский","Соломенский","Оболонский","Подольский","Печерский","Шевченковский","Дарницкий","Днепровский","Деснянский"];
exports.ADRESSES = ADRESSES;
