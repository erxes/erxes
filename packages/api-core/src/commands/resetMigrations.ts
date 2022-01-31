import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';

dotenv.config();

const options = {
  useNewUrlParser: true,
  useCreateIndex: true
};

const main = async () => {
  const mongoClient = await mongoose.createConnection(
    process.env.MONGO_URL || '',
    options
  );

  const migrations = mongoClient.db.collection('migrations');

  await migrations.deleteMany({});

  process.exit();
};

main();
