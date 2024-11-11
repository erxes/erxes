import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient('mongodb://localhost:27017/erxes?directConnection=true');

let db: Db;

let Charts: Collection<any>;

const command = async () => {
    await client.connect();
    db = client.db() as Db;

    Charts = db.collection('insight_charts');

    try {
        const charts = await Charts.find({
            $or: [
                { "filter.chartAssignedUserIds": { $exists: true } },
                { "filter.chartAssignedDepartmentIds": { $exists: true } },
                { "filter.chartAssignedBranchIds": { $exists: true } },
                { "filter.selectedBrands": { $exists: true } },
                { "filter.selecteForms": { $exists: true } },
                { "filter.selectePortal": { $exists: true } },
                { "filter.assets": { $exists: true } },
                { "filter.companyId": { $exists: true } },
                { "filter.customerId": { $exists: true } },
                { "filter.productId": { $exists: true } }
            ]
        }).toArray();

        const bulkOperations: any = [];

        for (const chart of charts) {
            const updates: any = {};
            const unsetFields: any = {};

            if (chart.filter?.chartAssignedUserIds) {
                updates["filter.userIds"] = chart.filter.chartAssignedUserIds;
                unsetFields["filter.chartAssignedUserIds"] = "";
            }

            if (chart.filter?.chartAssignedDepartmentIds) {
                updates["filter.departmentIds"] = chart.filter.chartAssignedDepartmentIds;
                unsetFields["filter.chartAssignedDepartmentIds"] = "";
            }

            if (chart.filter?.chartAssignedBranchIds) {
                updates["filter.branchIds"] = chart.filter.chartAssignedBranchIds;
                unsetFields["filter.chartAssignedBranchIds"] = "";
            }

            if (chart.filter?.selectedBrands) {
                updates["filter.brandIds"] = chart.filter.selectedBrands;
                unsetFields["filter.selectedBrands"] = "";
            }

            if (chart.filter?.selecteForms) {
                updates["filter.formIds"] = chart.filter.selecteForms;
                unsetFields["filter.selecteForms"] = "";
            }

            if (chart.filter?.selectePortal) {
                updates["filter.portalIds"] = chart.filter.selectePortal;
                unsetFields["filter.selectePortal"] = "";
            }

            if (chart.filter?.assets) {
                updates["filter.assetIds"] = chart.filter.assets;
                unsetFields["filter.assets"] = "";
            }

            if (chart.filter?.companyId) {
                updates["filter.companyIds"] = chart.filter.companyId;
                unsetFields["filter.companyId"] = "";
            }

            if (chart.filter?.customerId) {
                updates["filter.customerIds"] = chart.filter.customerId;
                unsetFields["filter.customerId"] = "";
            }

            if (chart.filter?.productId) {
                updates["filter.productIds"] = chart.filter.productId;
                unsetFields["filter.productId"] = "";
            }

            if (Object.keys(updates).length > 0 || Object.keys(unsetFields).length > 0) {
                bulkOperations.push({
                    updateOne: {
                        filter: { _id: chart._id },
                        update: {
                            $set: updates,
                            $unset: unsetFields
                        }
                    }
                });
            }

            if (bulkOperations.length > 0) {
                await Charts.bulkWrite(bulkOperations);
            }
        }
    } catch (e) {
        console.log(`Error occurred: ${e.message}`);
    }

    console.log(`Process finished at: ${new Date()}`);

    process.exit();
};

command();
