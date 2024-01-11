import { MongoClient } from 'mongodb';

const MONGO_URL = process.argv[2] || 'mongodb://localhost:27017/erxes';

console.log('MONGO_URL', MONGO_URL);

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;

let Deals;
let Items;
let Customers;

const command = async () => {
  try {
    await client.connect();
    console.log('Connected to ', MONGO_URL);
    db = client.db();

    Deals = db.collection('deals');
    Items = db.collection('insurance_items');
    Customers = db.collection('customers');

    const items = await Items.find({}).toArray();

    for (const item of items) {
      const deal = await Deals.findOne({ _id: item.dealId });
      const customer = await Customers.findOne({ _id: item.customerId });

      if (!customer) {
        console.log(`Customer not found for item ${item._id}`);
        continue;
      }

      if (!item.searchDictionary) {
        const searchDictionary = {
          dealNumber: deal.number,
          dealCreatedAt: new Date(deal.createdAt),
          dealCloseDate: new Date(deal.closeDate),
          dealStartDate: new Date(deal.startDate),
          customerRegister: customer.code,
          customerFirstName: customer.firstName,
          customerLastName: customer.lastName,
          itemPrice: item.price,
          itemFeePercent: item.feePercent,
          itemTotalFee: item.totalFee
        };

        await Items.updateOne(
          { _id: item._id },
          { $set: { searchDictionary } }
        );
      } else {
        const searchDictionary = {
          dealNumber: deal.number,
          dealCreatedAt: new Date(deal.createdAt),
          dealCloseDate: new Date(deal.closeDate),
          dealStartDate: new Date(deal.startDate),
          customerRegister: customer.code,
          customerFirstName: customer.firstName,
          customerLastName: customer.lastName,
          itemPrice: item.price,
          itemFeePercent: item.feePercent,
          itemTotalFee: item.totalFee
        };

        await Items.updateOne(
          { _id: item._id },
          { $set: { searchDictionary } }
        );
      }
    }
  } catch (e) {
    console.error('eeeeeeee ', e);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
