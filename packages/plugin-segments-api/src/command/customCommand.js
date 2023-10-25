const dotenv = require('dotenv');

const args = process.argv.slice(2);

let totalAmountFieldId = '';
let totalCountFieldId = '';

if (args.length > 0) {
  totalAmountFieldId = args[0];
  totalCountFieldId = args[1];
} else {
  throw new Error('No input provided via command-line arguments.');
}

if (!totalAmountFieldId || !totalCountFieldId) {
  throw new Error(
    'please provide a segment ID or a total amount field ID or a total count field ID'
  );
}

console.log({ totalAmountFieldId, totalCountFieldId });

dotenv.config();

const { MongoClient } = require('mongodb');
const { API_MONGO_URL = 'mongodb://localhost/erxes' } = process.env;

if (!API_MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(API_MONGO_URL);

let db;

let Customers;
let Deals;
let Conformities;
let Stages;

const generateAmounts = (productsData, useTick = true) => {
  let totalAmount = 0;

  (productsData || []).forEach(product => {
    // Tick paid or used is false then exclude
    if (useTick && !product.tickUsed) {
      return;
    }

    if (!useTick && product.tickUsed) {
      return;
    }

    totalAmount += product?.amount || 0;
  });

  return totalAmount;
};

const generateOperation = async ({
  customer,
  totalAmountFieldId,
  totalAmount,
  totalCountFieldId,
  totalCount
}) => {
  const commonSelector = {
    filter: {
      _id: customer._id
    }
  };

  const isExistTotalAmountField = !!(customer?.customFieldsData || []).find(
    ({ field }) => field === totalAmountFieldId
  );

  const isExistTotalCountField = !!(customer?.customFieldsData || []).find(
    ({ field }) => field === totalCountFieldId
  );

  if (isExistTotalAmountField || isExistTotalCountField) {
    if (isExistTotalAmountField && isExistTotalCountField) {
      return {
        updateOne: {
          ...commonSelector,
          update: {
            $set: {
              [`customFieldsData.$[elem1].value`]: totalAmount,
              [`customFieldsData.$[elem2].value`]: totalCount
            }
          },
          arrayFilters: {
            'elem1.field': totalAmountFieldId,
            'elem2.value': totalCountFieldId
          }
        }
      };
    }

    if (isExistTotalAmountField && !isExistTotalCountField) {
      return {
        updateOne: {
          ...commonSelector,
          update: {
            $set: {
              [`customFieldsData.$[elem1].value`]: totalAmount
            },
            $push: {
              field: totalCountFieldId,
              value: totalCount,
              stringValue: totalCount
            }
          },
          arrayFilters: {
            'elem1.field': totalAmountFieldId
          }
        }
      };
    }
    if (!isExistTotalAmountField && isExistTotalCountField) {
      return {
        updateOne: {
          ...commonSelector,
          update: {
            $set: {
              [`customFieldsData.$[elem1].value`]: totalCount
            },
            $push: {
              field: totalAmountFieldId,
              value: totalAmount,
              stringValue: totalAmount
            }
          },
          arrayFilters: {
            'elem1.field': totalCountFieldId
          }
        }
      };
    }
  }

  return {
    updateOne: {
      ...commonSelector,
      update: {
        $push: {
          customFieldsData: {
            $each: [
              {
                field: totalAmountFieldId,
                value: totalAmount,
                stringValue: totalAmount
              },
              {
                field: totalCountFieldId,
                value: totalCount,
                stringValue: totalCount
              }
            ]
          }
        }
      }
    }
  };
};

const command = async () => {
  console.log(`starting ... ${API_MONGO_URL}`);

  await client.connect();

  console.log('db connected ...');

  db = client.db();

  Customers = db.collection('customers');
  Deals = db.collection('deals');
  Conformities = db.collection('conformities');
  Stages = db.collection('stages');

  console.log('starting ...');

  const limit = 10000;

  const allCustomersCount = await Customers.find({}).count();

  const count = Math.ceil(allCustomersCount / limit);

  console.log(`${allCustomersCount} customers ${count} times will loop `);

  const stageIds = (
    await Stages.find({ _id: { $in: ['PZXJAbzgvFwaAaR87'] } }).toArray()
  ).map(stage => stage._id);

  console.log({ stageIds });

  for (let i = 1; i <= count; i++) {
    const bulkDocs = [];

    const customers = await Customers.find({})
      .limit(limit)
      .skip(limit * i)
      .toArray();

    const conformityCustomerIds = customers.map(customer => customer._id);

    const conformities = await Conformities.find({
      mainType: 'deal',
      relType: 'customer',
      relTypeId: { $in: conformityCustomerIds }
    }).toArray();

    for (const customer of customers) {
      let totalAmount = 0;
      let totalDeals = 0;

      const relatedDealIds = conformities
        .filter(conformity => conformity.relTypeId === customer._id)
        .map(conformity => conformity.mainTypeId);

      const relatedDeals = await Deals.find({
        _id: { $in: relatedDealIds },
        stageId: { $in: stageIds }
      }).toArray();

      console.log(`${relatedDeals.length} on customerId:${customer._id}`);

      for (const relatedDeal of relatedDeals) {
        const amount = generateAmounts(relatedDeal.productsData || []);

        totalAmount += amount || 0;
        totalDeals += 1;
      }

      const doc = await generateOperation({
        customer,
        totalAmount,
        totalAmountFieldId,
        totalCount: totalDeals,
        totalCountFieldId
      });

      bulkDocs.push(doc);
    }

    console.log(`${bulkDocs.length} date will be update to loop:${i}`);

    try {
      Customers.bulkWrite(bulkDocs);
      console.log(`${bulkDocs.length} customers successfully updated`);
      console.log(`loop ${i} done.`);
    } catch (e) {
      console.log(`Error occurred: ${e.message}`);
    }
  }
  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
