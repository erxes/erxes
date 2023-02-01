import mongoDb from 'mongodb';

var MongoClient = mongoDb.MongoClient;

var MONGO_URL = process.argv[2];

if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
}

var client = new MongoClient(MONGO_URL);

console.log("Connected to ", MONGO_URL)

let db;

let Deals;
let Participants;

var command = async () => {
    await client.connect();
    db = client.db();

    Deals = db.collection("deals");
    Participants = db.collection("participants");

    var participants = await Participants.find({}).toArray();

    for (var participant of participants) {
        var deal = await Deals.findOne({ _id: participant.dealId });

        if (!deal) {
            continue;
        }

        await Participants.updateOne(
            { _id: participant._id },
            { $set: { detail: [{ price: participant.detail.price, date: deal.createdAt }] } }
        );

    }

    console.log(`Process finished at: ${new Date()}`);

    process.exit();
};

command();
