import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/erxes';

async function addTypeToTranslations() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const translationsCollection = db.collection('translations');

    // Check if collection exists
    const collections = await db.listCollections({ name: 'translations' }).toArray();
    if (collections.length === 0) {
      console.log('⚠️  Translations collection does not exist yet. Nothing to migrate.');
      await mongoose.disconnect();
      return;
    }

    // Count documents without type field
    const countWithoutType = await translationsCollection.countDocuments({
      type: { $exists: false }
    });

    console.log(`📊 Found ${countWithoutType} translations without type field`);

    if (countWithoutType === 0) {
      console.log('✅ All translations already have type field. Nothing to migrate.');
      await mongoose.disconnect();
      return;
    }

    // Update all documents without type field to have default 'post' type
    const result = await translationsCollection.updateMany(
      { type: { $exists: false } },
      { $set: { type: 'post' } }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addTypeToTranslations();
