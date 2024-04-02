import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let PipelineTemplates: Collection<any>;
let Deal_PipelineTemplates: Collection<any>;
let Task_PipelineTemplates: Collection<any>;
let Ticket_PipelineTemplates: Collection<any>;
let Purchase_PipelineTemplates: Collection<any>;
let GH_PipelineTemplates: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  PipelineTemplates = db.collection('pipeline_templates');
  Deal_PipelineTemplates = db.collection('deal_pipeline_templates');
  Task_PipelineTemplates = db.collection('task_pipeline_templates');
  Ticket_PipelineTemplates = db.collection('ticket_pipeline_templates');
  Purchase_PipelineTemplates = db.collection('purchase_pipeline_templates');
  GH_PipelineTemplates = db.collection('growthhack_pipeline_templates');

  const dealPipelineTemplates = await PipelineTemplates.find({
    type: 'deal',
  }).toArray();
  const taskPipelineTemplates = await PipelineTemplates.find({
    type: 'task',
  }).toArray();
  const ticketPipelineTemplates = await PipelineTemplates.find({
    type: 'ticket',
  }).toArray();
  const purchasePipelineTemplates = await PipelineTemplates.find({
    type: 'purchase',
  }).toArray();
  const ghPipelineTemplates = await PipelineTemplates.find({
    type: 'growthHack',
  }).toArray();

  // // Insert documents into each borads collections collection
  if (dealPipelineTemplates.length > 0) {
    await Deal_PipelineTemplates.insertMany(dealPipelineTemplates);
  }

  if (taskPipelineTemplates.length > 0) {
    await Task_PipelineTemplates.insertMany(taskPipelineTemplates);
  }

  if (ticketPipelineTemplates.length > 0) {
    await Ticket_PipelineTemplates.insertMany(ticketPipelineTemplates);
  }

  if (purchasePipelineTemplates.length > 0) {
    await Purchase_PipelineTemplates.insertMany(purchasePipelineTemplates);
  }

  if (ghPipelineTemplates.length > 0) {
    await GH_PipelineTemplates.insertMany(ghPipelineTemplates);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
