const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { nanoid } = require('nanoid');
const { data } = require('./priusRemData');

dotenv.config();

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } =
  process.env;

const USER_ID = process.env.PRIUS_SAFE_REM_USER_ID || process.env.USER_ID || '';
const SAFE_REM_DATE = new Date('2025-05-25');
const NEW_PROC_CAT_ID = 'U9jKI-ZhzxFaLuwu2eoU6';
const NEW_PROC_UOM = 'ш';

const client = new MongoClient(MONGO_URL);

const branchCodeByLocCode = {
  '0001': ['', ''], // Үндсэн байгууллага
  1000: ['1000', ''], // Төв-1 Салбар
  1100: ['1100', ''], // 5 буудал --*
  2000: ['2000', ''], // 5 Шар
  3000: ['3000', ''], // 32 Салбар
  4000: ['4000', ''], // Яармаг салбар
  5000: ['5000', ''], // Төв-2 салбар
  6000: ['6000', ''], // Зурагт Салбар
  7000: ['7000', ''], // Амгалан салбар
  7200: ['7200', '015'], // Агуулах Шинэ
  7300: ['7200', '016'], // Агуулах-2 Задаргаа бөөнийх
  8000: ['8000', ''], // Содон салбар
  8100: ['8100', ''], // 120 салбар ---*
  8200: ['9010', ''], // Энхтайваны гүүр
  1001: ['1001', ''], // Лаборатори
  1002: ['1000', '009'], // Акталсан бараа Гандан 1 салбар
  1101: ['1100', '009'], // Акталсан бараа 5 Буудал салбар --*
  2001: ['2000', '009'], // Акталсан бараа 5 Шар салбар
  3001: ['3000', '009'], // Акталсан бараа 32 салбар
  4001: ['4000', '009'], // Акталсан бараа Яармаг салбар
  5001: ['5000', '009'], // Акталсан бараа Гандан 2 салбар
  6001: ['6000', '009'], // Акталсан бараа Зурагт салбар
  7001: ['7000', '009'], // Акталсан бараа Амгалан салбар
  7201: ['7200', '009'], // Акталсан бараа /Шинэ/
  7301: ['7200', '009'], // Акталсан бараа /Задаргаа/
  8001: ['8000', '009'], // Акталсан бараа Содон салбар
  8101: ['8100', '009'], // Акталсан бараа 120 салбар --*
  8201: ['9010', '009'], // Акталсан бараа Энхтайваны гүүр салбар
  1200: ['', '015'], // Бөөний тасаг
  6100: ['6100', ''], // МТ - 27 --*
  6200: ['6200', ''], // МТ - 127 --*
  9000: ['', ''], // Golden time team 1 - Гантулга --*
};

const findByCode = async (collection, code) => {
  if (!code) {
    return null;
  }

  return collection.findOne({ code });
};

const getOrCreateProduct = async (Products, code, now) => {
  const product = await Products.findOne({ code });

  if (product) {
    return product;
  }

  const newProduct = {
    _id: nanoid(),
    code,
    name: code,
    categoryId: NEW_PROC_CAT_ID,
    type: 'product',
    status: 'active',
    uom: NEW_PROC_UOM,
    unitPrice: 0,
    createdAt: now,
    updatedAt: now,
  };

  await Products.insertOne(newProduct);

  return newProduct;
};

const getOrCreateSafeRemainder = async ({
  SafeRemainders,
  branchId,
  departmentId,
  accountId,
  now,
  accCode,
  locCode,
}) => {
  const selector = {
    branchId,
    departmentId,
    'incomeRule.accountId': accountId,
  };

  const existing = await SafeRemainders.findOne(selector);
  if (existing) {
    return existing;
  }

  const safeRemainder = {
    _id: nanoid(),
    branchId,
    departmentId,
    productCategoryId: '',
    attachment: null,
    date: SAFE_REM_DATE,
    description: `Opening remainder ${accCode} = ${locCode}`,
    status: 'draft',
    incomeRule: {
      accountId,
      customerType: '',
      customerId: '',
    },
    incomeTrId: '',
    outRule: {},
    outTrId: '',
    saleRule: {},
    saleTrId: '',
    createdAt: now,
    createdBy: USER_ID,
    modifiedAt: now,
    modifiedBy: USER_ID,
  };

  await SafeRemainders.insertOne(safeRemainder);

  return safeRemainder;
};

const upsertSafeRemainderItem = async ({
  SafeRemainderItems,
  safeRemainderId,
  product,
  row,
  order,
  now,
}) => {
  let count = Number(row.rem || 0);
  let cost = Number(row.cost || 0);
  if (count < 0.005 && count > -0.005) {
    count = 0;
  }
  if (cost < 0.005 && cost > -0.005) {
    cost = 0;
  }

  if (!count && !cost) {
    return;
  }
  if (!count) {
    count = Number(row.rem || 0) || 0.001;
  }

  const selector = {
    remainderId: safeRemainderId,
    productId: product._id,
  };

  const doc = {
    remainderId: safeRemainderId,
    productId: product._id,
    preCount: 0,
    count,
    cost,
    status: 'checked',
    uom: product.uom || '',
    modifiedAt: now,
    modifiedBy: USER_ID,
    order,
    description: '',
    trInfo: {
      unitCost: count < 0.01 ? cost : cost / count,
    },
  };

  const existing = await SafeRemainderItems.findOne(selector);
  if (!existing) {
    await SafeRemainderItems.insertOne({
      _id: nanoid(),
      ...doc,
    });
    return;
  }

  delete doc.order;

  await SafeRemainderItems.updateOne(selector, {
    $set: doc,
  });

  return;
};

const command = async () => {
  if (Number.isNaN(SAFE_REM_DATE.getTime())) {
    throw new Error('Invalid PRIUS_SAFE_REM_DATE');
  }

  await client.connect();

  const db = client.db();
  const Accounts = db.collection('accounts');
  const Branches = db.collection('branches');
  const Departments = db.collection('departments');
  const Products = db.collection('products');
  const SafeRemainderItems = db.collection('safe_remainder_items');
  const SafeRemainders = db.collection('safe_remainders');

  const knownSafeRemIds = new Set();
  const itemOrderByRemainderId = {};

  for (const row of data) {
    const now = new Date();
    const accCode = row.accCode;
    const locCode = row.locCode;
    const invCode = row.invCode;

    const count = Number(row.rem || 0);
    if (count < 0.005 && count > -0.005) {
      continue;
    }

    const locationMap = branchCodeByLocCode[locCode];

    if (!locationMap) {
      console.log('notFound Map loc', row.accid, row.locId, row.invId);
      continue;
    }

    const [branchCode, departmentCode] = locationMap;
    // if (!branchCode && !departmentCode) {
    //   console.log('empty Map loc', row.accid, row.locId, row.invId);
    //   continue;
    // }

    const account = await findByCode(Accounts, accCode);
    if (!account) {
      console.log('notFound Account', row.accid, row.locId, row.invId);
      continue;
    }

    const branch = await findByCode(Branches, branchCode);
    if (branchCode && !branch) {
      console.log('notFound Branch', row.accid, row.locId, row.invId);
      continue;
    }

    const department = await findByCode(Departments, departmentCode);
    if (departmentCode && !department) {
      console.log('notFound Department', row.accid, row.locId, row.invId);
      continue;
    }

    const product = await getOrCreateProduct(Products, invCode, now);

    const safeRemainder = await getOrCreateSafeRemainder({
      SafeRemainders,
      branchId: branch?._id || '',
      departmentId: department?._id || '',
      accountId: account._id,
      now,
      accCode: row.accCode,
      locCode: row.locCode,
    });

    if (!knownSafeRemIds.has(safeRemainder._id)) {
      knownSafeRemIds.add(safeRemainder._id);
      itemOrderByRemainderId[safeRemainder._id] =
        (await SafeRemainderItems.countDocuments({
          remainderId: safeRemainder._id,
        })) || 0;
    }

    itemOrderByRemainderId[safeRemainder._id]++;

    await upsertSafeRemainderItem({
      SafeRemainderItems,
      safeRemainderId: safeRemainder._id,
      product,
      row,
      order: itemOrderByRemainderId[safeRemainder._id],
      now,
    });
  }

  console.log('Prius safe remainder import finished');

  await client.close();
};

command().catch(async (error) => {
  console.error(error);
  await client.close();
  process.exit(1);
});
