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
let Deal_Pipelines: Collection<any>;
let Task_Pipelines: Collection<any>;
let Ticket_Pipelines: Collection<any>;
let Purchase_Pipelines: Collection<any>;
let GH_Pipelines: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Pipelines = db.collection('pipelines');
  Deal_Pipelines = db.collection('deal_pipelines');
  Task_Pipelines = db.collection('task_pipelines');
  Ticket_Pipelines = db.collection('ticket_pipelines');
  Purchase_Pipelines = db.collection('purchase_pipelines');
  GH_Pipelines = db.collection('growthhack_pipelines');

  const dealPipelines = await Pipelines.find({ type: 'deal' }).toArray();
  const taskPipelines = await Pipelines.find({ type: 'task' }).toArray();
  const ticketPipelines = await Pipelines.find({ type: 'ticket' }).toArray();
  const purchasePipelines = await Pipelines.find({
    type: 'purchase',
  }).toArray();
  const ghPipelines = await Pipelines.find({ type: 'growthHack' }).toArray();

  // // Insert documents into each pipelines collections collection
  if (dealPipelines.length > 0) {
    await Deal_Pipelines.insertMany(dealPipelines);
  }

  if (taskPipelines.length > 0) {
    await Task_Pipelines.insertMany(taskPipelines);
  }

  if (ticketPipelines.length > 0) {
    await Ticket_Pipelines.insertMany(ticketPipelines);
  }

  if (purchasePipelines.length > 0) {
    await Purchase_Pipelines.insertMany(purchasePipelines);
  }

  if (ghPipelines.length > 0) {
    await GH_Pipelines.insertMany(ghPipelines);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
