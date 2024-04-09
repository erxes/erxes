import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
const { MONGO_URL } = process.env;

const client = new MongoClient(MONGO_URL || 'mongodb://localhost/erxes');

let db: Db;

let ReportCharts: Collection<any>;
let DashboardCharts: Collection<any>;
let InsightCharts: Collection<any>;

const command = async () => {
    console.log(`start.... ${MONGO_URL}`);

    await client.connect();

    console.log('connected...');
    db = client.db() as Db;

    ReportCharts = db.collection('report_charts');
    DashboardCharts = db.collection('dashboard_charts');
    InsightCharts = db.collection('insight_charts');

    const dashboardCharts = await DashboardCharts.find().toArray();
    const reportCharts = await ReportCharts.find().toArray();

    const insightCharts: any[] = [];

    for (const chart of dashboardCharts) {
        const { dashboardId, ...rest } = chart;
        insightCharts.push({ contentId: dashboardId, contentType: "insight:dashboard", ...rest });
    }

    for (const chart of reportCharts) {
        const { reportId, ...rest } = chart;
        insightCharts.push({ contentId: reportId, contentType: "insight:report", ...rest });
    }

    if (!(await db.listCollections({ name: 'insight_charts' }).hasNext())) {
        await db.createCollection('insight_charts');
    }

    if (insightCharts.length > 0) {
        await InsightCharts.insertMany(insightCharts);
        console.log(`Inserted ${insightCharts.length} charts into insight_charts`);

        await DashboardCharts.drop();
        await ReportCharts.drop();
        console.log('Deleted dashboard_charts and report_charts collections');
    } else {
        console.log('No charts to insert');
    }


    console.log(`Process finished at: ${new Date()}`);

    process.exit();
}

command();
