import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Boards: Collection<any>;
let Deal_Boards: Collection<any>;
let Task_Boards: Collection<any>;
let Ticket_Boards: Collection<any>;
let Purchase_Boards: Collection<any>;
let GH_Boards: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Boards = db.collection('boards');
  Deal_Boards = db.collection('deal_boards');
  Task_Boards = db.collection('task_boards');
  Ticket_Boards = db.collection('ticket_boards');
  Purchase_Boards = db.collection('purchase_boards');
  GH_Boards = db.collection('growthhack_boards');

  const dealBoards = await Boards.find({ type: 'deal' }).toArray();
  const taskBoards = await Boards.find({ type: 'task' }).toArray();
  const ticketBoards = await Boards.find({ type: 'ticket' }).toArray();
  const purchaseBoards = await Boards.find({ type: 'purchase' }).toArray();
  const ghBoards = await Boards.find({ type: 'growthHack' }).toArray();

  // // Insert documents into each boards collections collection

  if (dealBoards.length > 0) {
    await Deal_Boards.insertMany(dealBoards);
  }

  if (taskBoards.length > 0) {
    await Task_Boards.insertMany(taskBoards);
  }

  if (ticketBoards.length > 0) {
    await Ticket_Boards.insertMany(ticketBoards);
  }

  if (purchaseBoards.length > 0) {
    await Purchase_Boards.insertMany(purchaseBoards);
  }

  if (ghBoards.length > 0) {
    await GH_Boards.insertMany(ghBoards);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
