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

let Companies: Collection<any>;

const fillSearchText = (doc) => {

    const searchText = [
        (doc.names || []).join(" "),
        (doc.emails || []).join(" "),
        (doc.phones || []).join(" "),
        doc.website || "",
        doc.industry || "",
        doc.plan || "",
        doc.description || "",
        doc.code || ""
    ]

    const existingSearchText = doc.searchText?.split(" ").filter(Boolean) || [];

    const searchTexts = [...new Set([...searchText, ...existingSearchText])];

    return validSearchText(searchTexts);
}

const command = async () => {
    await client.connect();
    db = client.db() as Db;

    Companies = db.collection('companies');

    const companies = await Companies.find({}).toArray();

    const bulkOperations = companies.map(company => ({
        updateOne: {
            filter: { _id: company._id },
            update: { $set: { searchText: fillSearchText(company) } }
        }
    }));

    if (bulkOperations.length > 0) {
        await Companies.bulkWrite(bulkOperations);
    }

    console.log(`Process finished at: ${new Date()}`);

    process.exit();
};

command();