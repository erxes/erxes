import mongoDb from 'mongodb';
import { nanoid } from 'nanoid';

const MongoClient = mongoDb.MongoClient;

const MONGO_URL = process.argv[2] || 'mongodb://localhost:27017/erxes';

console.log('MONGO_URL', MONGO_URL);

if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });

let db;

let Cards;
let ClientPortals;

const command = async () => {
    try {
        await client.connect();
        console.log('Connected to ', MONGO_URL);
        db = client.db();

        Cards = db.collection('client_portal_user_cards');
        ClientPortals = db.collection('client_portals');

        await ClientPortals.updateMany({}, { $set: { kind: 'client' } });

        const cards = await Cards.find({}).toArray();

        for (const card of cards) {
            for (const userId of card.userIds) {
                const doc = {
                    _id: nanoid(),
                    contentType: card.type,
                    contentTypeId: card.cardId,
                    createdAt: card.createdAt,
                    cpUserId: userId,
                };
                await Cards.insertOne(doc);
            }

            await Cards.deleteOne({ _id: card._id });
        }
    }
    catch (e) {
        console.error("eeeeeeee ",e);
    }


    console.log(`Process finished at: ${new Date()}`);

    process.exit();
};

command();
