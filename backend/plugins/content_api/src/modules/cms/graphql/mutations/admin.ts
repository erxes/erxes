import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const adminMutations: Record<string, Resolver> = {
  /**
   * Fix translation index issues manually
   * This endpoint can be called by admins to fix translation issues
   */
  cmsFixTranslationIndex: async (_parent, _args, context: IContext) => {
    const { models } = context;
    
    try {
      const db = models.Translations.db;
      const translationsCollection = db.collection('cms_translations');
      
      // Get current indexes
      const indexes = await translationsCollection.indexes();
      console.log('Current indexes:', indexes.map(idx => idx.name));
      
      // Drop old index if exists
      const oldIndexExists = indexes.some(idx => idx.name === 'postId_1_language_1_type_1');
      if (oldIndexExists) {
        await translationsCollection.dropIndex('postId_1_language_1_type_1');
        console.log('Dropped old postId_1_language_1_type_1 index');
      }
      
      // Clean up null objectId documents
      const nullCount = await translationsCollection.countDocuments({ objectId: null });
      if (nullCount > 0) {
        await translationsCollection.deleteMany({ objectId: null });
        console.log(`Deleted ${nullCount} documents with null objectId`);
      }
      
      // Create correct index if needed
      const correctIndexExists = indexes.some(idx => idx.name === 'objectId_1_language_1_type_1');
      if (!correctIndexExists) {
        await translationsCollection.createIndex(
          { objectId: 1, language: 1, type: 1 },
          { unique: true, name: 'objectId_1_language_1_type_1' }
        );
        console.log('Created objectId_1_language_1_type_1 index');
      }
      
      return {
        success: true,
        message: 'Translation index fix completed successfully',
        details: {
          oldIndexRemoved: oldIndexExists,
          nullDocumentsDeleted: nullCount,
          correctIndexCreated: !correctIndexExists
        }
      };
      
    } catch (error: any) {
      console.error('Translation index fix failed:', error);
      return {
        success: false,
        message: error.message,
        error: error.toString()
      };
    }
  }
};
