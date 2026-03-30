import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/erxes';

async function fixTranslationIndex() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const translationsCollection = db.collection('cms_translations');

    // Check if collection exists
    const collections = await db.listCollections({ name: 'cms_translations' }).toArray();
    if (collections.length === 0) {
      console.log('⚠️  cms_translations collection does not exist yet. Nothing to migrate.');
      await mongoose.disconnect();
      return;
    }

    // Get existing indexes
    const indexes = await translationsCollection.indexes();
    console.log('📊 Current indexes:', indexes.map(idx => idx.name));

    // Drop the old postId-based index if it exists
    const oldPostIdIndex = indexes.find(idx => idx.name === 'postId_1_language_1_type_1');
    if (oldPostIdIndex) {
      await translationsCollection.dropIndex('postId_1_language_1_type_1');
      console.log('🗑️  Dropped old postId_1_language_1_type_1 index');
    } else {
      console.log('ℹ️  Old postId_1_language_1_type_1 index not found');
    }

    // Clean up documents with null objectId before creating index
    const nullObjectIdDocs = await translationsCollection.countDocuments({
      objectId: null
    });

    if (nullObjectIdDocs > 0) {
      console.log(`🧹 Found ${nullObjectIdDocs} documents with null objectId, cleaning up...`);
      
      // Delete documents with null objectId as they're invalid
      const deleteResult = await translationsCollection.deleteMany({
        objectId: null
      });
      
      console.log(`🗑️  Deleted ${deleteResult.deletedCount} documents with null objectId`);
    }

    // Also check for any legacy postId field and migrate it to objectId if needed
    const documentsWithPostId = await translationsCollection.countDocuments({
      postId: { $exists: true },
      objectId: { $exists: false }
    });

    if (documentsWithPostId > 0) {
      console.log(`🔄 Found ${documentsWithPostId} documents with postId but no objectId`);
      
      // Migrate postId to objectId
      const updateResult = await translationsCollection.updateMany(
        { postId: { $exists: true }, objectId: { $exists: false } },
        { $rename: { postId: 'objectId' } }
      );
      
      console.log(`✅ Migrated ${updateResult.modifiedCount} documents from postId to objectId`);
    }

    // Check if the correct objectId-based index exists
    const objectIdIndex = indexes.find(idx => idx.name === 'objectId_1_language_1_type_1');
    if (!objectIdIndex) {
      // Create the correct objectId-based index
      await translationsCollection.createIndex(
        { objectId: 1, language: 1, type: 1 },
        { unique: true, name: 'objectId_1_language_1_type_1' }
      );
      console.log('✅ Created objectId_1_language_1_type_1 index');
    } else {
      console.log('ℹ️  objectId_1_language_1_type_1 index already exists');
    }

    console.log('✅ Migration completed successfully!');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixTranslationIndex();
