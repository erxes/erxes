import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
import { validSearchText } from '@erxes/api-utils/src';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Customers: Collection<any>;

const fillSearchText = (doc) => {

    const searchText = [
        (doc.emails || []).join(" "),
        (doc.phones || []).join(" "),
        doc.firstName || "",
        doc.lastName || "",
        doc.middleName || "",
        doc.primaryEmail || "",
        doc.primaryPhone || "",
    ]

    const existingSearchText = doc.searchText?.split(" ").filter(Boolean) || [];

    const searchTexts = [...new Set([...searchText, ...existingSearchText])];

    return validSearchText(searchTexts);
}

const command = async () => {
    await client.connect();
    db = client.db() as Db;

    Customers = db.collection('customers');

    const customers = await Customers.find({}).toArray();

    const bulkOperations = customers.map(customer => ({
        updateOne: {
            filter: { _id: customer._id },
            update: { $set: { searchText: fillSearchText(customer) } }
        }
    }));

    if (bulkOperations.length > 0) {
        await Customers.bulkWrite(bulkOperations);
    }

    console.log(`Process finished at: ${new Date()}`);

    process.exit();
};

command();