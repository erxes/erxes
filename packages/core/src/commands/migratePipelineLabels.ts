import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Pipelines: Collection<any>;
let PipelineLabels: Collection<any>;
let Deal_PipelineLabels: Collection<any>;
let Task_PipelineLabels: Collection<any>;
let Ticket_PipelineLabels: Collection<any>;
let Purchase_PipelineLabels: Collection<any>;
let GH_PipelineLabels: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  PipelineLabels = db.collection('pipeline_labels');
  Pipelines = db.collection('pipelines');
  Deal_PipelineLabels = db.collection('deal_pipeline_labels');
  Task_PipelineLabels = db.collection('task_pipeline_labels');
  Ticket_PipelineLabels = db.collection('ticket_pipeline_labels');
  Purchase_PipelineLabels = db.collection('purchase_pipeline_labels');
  GH_PipelineLabels = db.collection('growthhack_pipeline_labels');

  const labelsArray = await PipelineLabels.find().toArray();

  for (const label of labelsArray) {
    const checklist = await Pipelines.findOne({
      _id: label.pipelineId,
    });

    if (checklist) {
      const contentType = checklist.type;

      if (contentType === 'deal') {
        await Deal_PipelineLabels.insertOne(label);
      }

      if (contentType === 'task') {
        await Task_PipelineLabels.insertOne(label);
      }

      if (contentType === 'ticket') {
        await Ticket_PipelineLabels.insertOne(label);
      }

      if (contentType === 'purchase') {
        await Purchase_PipelineLabels.insertOne(label);
      }

      if (contentType === 'growthHack') {
        await GH_PipelineLabels.insertOne(label);
      }
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
