const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');

dotenv.config();

const MONGO_URL = 'mongodb://localhost/erxes'

// common filters
const startDate = new Date('2023-5-1');
const endDate = new Date('2023-8-7');
const type = 'deal'; // 'deal' | 'order'

// deal filters
const stageIds = [];
const excludeStageIds = [];

// order filters
const posTokens = [];

const client = new MongoClient(MONGO_URL);
let db;

dotenv.config();

const getResponse = async (objId) => {
  const resp = await fetch(`http://localhost:8000/get-api/?kind=transaction&api_key=123456789&api_secret=987654321&filter_value=${objId}`,
    { method: 'GET', }
  )

  if (!(200 <= resp.status && resp.status < 300)) {
    return getResponse(objId)
  }
  return await resp.json();
}

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);

  await client.connect();
  db = client.db();

  console.log('connected...');

  Deals = db.collection('deals');
  Stages = db.collection('stages');
  PosOrders = db.collection('pos_orders');
  Conformities = db.collection('conformities');
  Customers = db.collection('customers');
  Companies = db.collection('companies');
  Products = db.collection('products');
  Users = db.collection('users');

  if (type === 'deal') {
    const selector = { createdAt: { $gte: startDate, $lte: endDate } }
    if (stageIds.length || excludeStageIds.length) {
      const $and = [];
      if (stageIds.length) {
        $and.push({ stageId: { $in: stageIds } });
      }
      if (excludeStageIds.length) {
        $and.push({ stageId: { $nin: excludeStageIds } });
      }
      selector.$and = $and
    }

    const deals = await Deals.find(selector).toArray();

    console.log(`found deals: ${deals.length}`)
    for (const deal of deals) {
      try {
        const erkhetTrs = await getResponse(deal._id);

        if (!erkhetTrs || !erkhetTrs.length) {
          const stage = await Stages.findOne({_id: deal.stageId}, {name: 1});
          console.log(`not erkhet> id: ${deal._id}, number: ${deal.number}, stage: ${stage.name}`);
          continue;
        }

        if (erkhetTrs.length > 1) {
          console.log(`many erkhet> id: ${deal._id}, number: ${deal.number}`);
          continue;
        }

        const erkhetTr = erkhetTrs[0];

        const infos = {
          object: deal
        }

        const conformities = await Conformities.find({
          $or: [
            { mainType: 'deal', mainTypeId: deal._id, relType: { $in: ['customer', 'company'] } },
            { relType: 'deal', relTypeId: deal._id, mainType: { $in: ['customer', 'company'] } }
          ]
        }).toArray();

        const customerIds = conformities.map(c => c.mainType === 'customer' && c.mainTypeId || (c.relType === 'customer' && c.relTypeId) || '').filter(c => c)
        const companyIds = conformities.map(c => c.mainType === 'company' && c.mainTypeId || c.relType === 'company' && c.relTypeId || '').filter(c => c)
        if (customerIds.length) {
          const customers = await Customers.find({ _id: { $in: customerIds } }).toArray();
          if (customers && customers.length) {
            infos.customers = customers
          }
        }
        if (companyIds.length) {
          const companies = await Companies.find({ _id: { $in: companyIds } }).toArray();
          if (companies && companies.length) {
            infos.companies = companies
          }
        }
        const productsData = deal.productsData.filter(p => p.tickUsed);

        if (!erkhetTr.records.length || productsData.length !== erkhetTr.records.length) {
          console.log(`diff length> id: ${deal._id}, number: ${deal.number}, pdataLen: ${productsData.length}, recordsLen: ${erkhetTr.records.length}`);
          continue;
        }

        if (erkhetTr.sync_type === 'sale') {
          erkhetTrExtra = JSON.parse(erkhetTr.extra) || {};
          const erkhetSumRecs = erkhetTr.records.reduce((sum, r) => Number(sum) + Number(r.credit) - Number(r.debit), 0) + (Number(erkhetTrExtra.vat?.value) || 0) + (Number(erkhetTrExtra.citytax?.value) || 0);
          const dealSumAmount = productsData.reduce((sum, r) => Number(sum) + Number(r.amount), 0)

          if (Math.round(erkhetSumRecs) !== Math.round(dealSumAmount)) {
            console.log(`diff amount> id: ${deal._id}, number: ${deal.number}, pdataAmount: ${dealSumAmount}, recordsAmount: ${erkhetSumRecs}`);
            continue;
          }

          if (companyIds.length || customerIds.length) {
            if (!(infos.companies || []).filter(c => c.code === erkhetTr.customer__code).length) {
              if (!(infos.customers || []).filter(c => c.code === erkhetTr.customer__code).length) {
                const allowCodes = (infos.companies || []).map(c => c.code).concat((infos.customers || []).map(c => c.code))
                console.log(`diff customer> id: ${deal._id}, number: ${deal.number}, dealCustomer: ${allowCodes.join(', ')}, recordsAmount: ${erkhetTr.customer__code}`);
                continue;
              }
            }
          }
        }
      } catch (e) {
        console.log(`id: ${deal._id}, number: ${deal.number}, err: ${e.message}`)
      }
    }
  }

  if (type === 'order') {
    const selector = { paidDate: { $gte: startDate, $lte: endDate } }
    if (posTokens.length) {
      selector.posToken = { $in: posTokens };
    }

    orders = await PosOrders.find(selector).toArray();

    console.log(`found orders: ${orders.length}`)
    for (const order of orders) {
      try {
        const erkhetTrs = await getResponse(order._id);

        if (!erkhetTrs || !erkhetTrs.length) {
          console.log(`not erkhet> id: ${order._id}, number: ${order.number}`);
          continue;
        }

        if (erkhetTrs.length > 1) {
          console.log(`many erkhet> id: ${order._id}, number: ${order.number}`);
          continue;
        }

        const erkhetTr = erkhetTrs[0];

        const infos = {
          object: order
        }

        if (order.customerId) {
          if (customerType === 'company') {
            infos.company = await Companies.findOne({ _id: order.customerId }).toArray();
          } else if (customerType === 'user') {
            infos.user = await Users.findOne({ _id: order.customerId }).toArray();
          } else {
            infos.customer = await Customers.findOne({ _id: order.customerId }).toArray();
          }
        }

        const orderItems = order.items;

        if (!erkhetTr.records.length || orderItems.length !== erkhetTr.records.length) {
          console.log(`diff length> id: ${order._id}, number: ${order.number}, pdataLen: ${orderItems.length}, recordsLen: ${erkhetTr.records.length}`);
          continue;
        }

        erkhetTrExtra = JSON.parse(erkhetTr.extra) || {};
        const erkhetSumRecs = erkhetTr.records.reduce((sum, r) => Number(sum) + Number(r.credit) - Number(r.debit), 0) + (Number(erkhetTrExtra.vat?.value) || 0) + (Number(erkhetTrExtra.citytax?.value) || 0);
        const orderSumVal = orderItems.reduce((sum, r) => Number(sum) + (Number(r.count) * Number(r.unitPrice)), 0)

        if (Math.round(erkhetSumRecs) !== Math.round(orderSumVal)) {
          console.log(`diff amount> id: ${order._id}, number: ${order.number}, pdataAmount: ${orderSumVal}, recordsAmount: ${erkhetSumRecs}`);
          continue;
        }

        if (order.customerId) {
          const orderCustomer = order.customerType === 'company' ? infos.company?.code :
            order.customerType === 'user' ? infos.user?.email :
              infos.customer?.code;

          if (
            orderCustomer !== erkhetTr.customer__code
          ) {
            console.log(`diff customer> id: ${order._id}, number: ${order.number}, orderCustomer: ${orderCustomer}, recordsAmount: ${erkhetTr.customer__code}`);
            continue;
          }
        }
      } catch (e) {
        console.log(`id: ${order._id}, number: ${order.number}, err: ${e.message}`)
      }
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
