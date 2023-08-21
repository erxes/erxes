const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');


dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);
let db;

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);
  await client.connect();
  db = client.db();

  console.log('connected...');

  Products = db.collection('products');
  Uoms = db.collection('uoms');
  Configs = db.collection('products_configs');
  let bulkUpdateOps = [];
  let counter = 0;
  let bulkCounter = 0;


  try {
    const defaultUomId = ((await Configs.find({ code: 'defaultUOM' }).toArray() || [{}])[0] || {}).value;
    const allUoms = await Uoms.find({}).toArray();
    const defaultUom = (allUoms.find(u => u._id === defaultUomId) || {}).code;

    const products = await Products.find().toArray();
    const allUomCodes = (allUoms || []).map(u => u.code);

    for (const product of products) {
      let uom = product.sku

      if (product.uomId) {
        const uomWithId = allUoms.find(u => u._id === product.uomId) || {};
        if (uomWithId.code) {
          uom = uomWithId.code
        }
      }

      if (!uom) {
        uom = defaultUom || ''
      }

      if (!uom) {
        uom = 'PC'
        console.log(`warning(main uom): productCode: "${product.code}"`)
      }

      if (!allUomCodes.includes(uom)) {
        allUomCodes.push(uom);
      }

      let subUoms = [];
      if (product.subUoms && product.subUoms.length) {
        for (const subUom of product.subUoms) {
          const subUomWithId = allUoms.find(u => u._id === subUom.uomId) || {};

          if (subUomWithId.code && subUom.ratio) {
            subUoms.push({ uom: subUomWithId.code, ratio: subUom.ratio })
            continue;
          }

          if (subUom.uom && subUom.ratio) {
            subUoms.push({ uom: subUom.uom, ratio: subUom.ratio })
            continue;
          }

          if (subUom.ratio) {
            subUoms.push({ ...subUom })
            console.log(`warning(subUom): productCode: "${product.code}", uomId: "${subUom.uomId}", uom: "${subUom.uom}" ratio: ${subUom.ratio}`)
            continue
          }

          console.log(`warning(subUom - no ratio): productCode: "${product.code}", uomId: "${subUom.uomId}", uom: "${subUom.uom}" ratio: ${subUom.ratio}`)
        }
      }

      bulkUpdateOps.push({
        updateOne: {
          filter: {
            _id: product._id
          },
          update: {
            $set: {
              uom,
              subUoms
            }
          }
        }
      });

      counter = counter + 1;

      if (counter > 1000) {
        bulkCounter = bulkCounter + 1;
        console.log(`updated ${bulkCounter * 1000}...`);
        await Products.bulkWrite(bulkUpdateOps);
        bulkUpdateOps = [];
        counter = 0;
      }
    }

    if (bulkUpdateOps.length) {
      console.log(`updated ${bulkCounter * 1000 + bulkUpdateOps.length}...`);
      await Products.bulkWrite(bulkUpdateOps);
    }

    bulkUpdateOps = [];

    for (const uomCode of allUomCodes) {
      bulkUpdateOps.push({
        updateOne: {
          filter: {
            code: uomCode
          },
          update: {
            $set: { code: uomCode },
            $setOnInsert: { name: uomCode }
          },
          upsert: true
        }
      });
    }

    if (bulkUpdateOps.length) {
      console.log(`updated uoms ${bulkUpdateOps.length}...`);
      await Uoms.bulkWrite(bulkUpdateOps);
    }
    if (defaultUom) {
      await Configs.updateOne({ code: 'defaultUOM' }, { $set: { value: defaultUom } })
    }
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
