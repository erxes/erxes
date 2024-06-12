const dotenv = require('dotenv');
dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
const { MONGO_URL } = process.env;

if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL || 'mongodb://localhost/erxes');

let db: Db;

let InsightCharts: Collection<any>;

const command = async () => {
    console.log(`start.... ${MONGO_URL}`);

    await client.connect();

    console.log('connected...');
    db = client.db() as Db;

    InsightCharts = db.collection('insight_charts');

    const insightCharts: any[] = await InsightCharts.find().toArray();

    for (const chart of insightCharts) {
        const { serviceName, filter, ...rest } = chart;
        const { dimension, measure, ...filters } = filter

        if (serviceName === 'cards') {

            const dimensions = dimension && Array.isArray(dimension) ? dimension : dimension?.split(',') || ['teamMember'];
            const measures = measure && Array.isArray(measure) ? measure : measure?.split(',') || ['count'];

            const filter = {
                dimension: dimensions,
                measure: measures,
                ...filters
            }

            insightCharts.push({ filter, ...rest });
        }
    }

    if (insightCharts.length > 0) {
        await InsightCharts.insertMany(insightCharts);
        console.log(`Changed ${insightCharts.length} charts dimension and measure`);
    } else {
        console.log('No charts to insert');
    }

    console.log(`Process finished at: ${new Date()}`);

    process.exit();
}

command();
