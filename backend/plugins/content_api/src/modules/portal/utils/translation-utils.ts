import { IModels } from '~/connectionResolvers';
import { ITranslation } from '../@types/translations';

export interface TranslationFieldMapping {
  [originalField: string]: string;
}

export class TranslationService {
  protected models: IModels;

  constructor(models: IModels) {
    this.models = models;
  }

  /**
   * Get translations for multiple items
   */
  async getTranslations(itemIds: string[], language: string): Promise<any[]> {
    if (!itemIds.length || !language) return [];

    return this.models.Translations.find({
      postId: { $in: itemIds },
      language,
    }).lean();
  }

  /**
   * Get translation for a single item
   */
  async getTranslation(itemId: string, language: string): Promise<any> {
    if (!itemId || !language) return null;

    return this.models.Translations.findOne({
      postId: itemId,
      language,
    }).lean();
  }

  /**
   * Create or update translation
   */
  async createOrUpdateTranslation(input: ITranslation): Promise<any> {
    const existingTranslation = await this.models.Translations.findOne({
      language: input.language,
      postId: input.postId,
    });

    if (existingTranslation) {
      return this.models.Translations.updateTranslation(
        existingTranslation._id,
        input
      );
    }

    return this.models.Translations.createTranslation(input);
  }

  /**
   * Delete translations for an item
   */
  async deleteTranslations(postId: string): Promise<void> {
    await this.models.Translations.deleteMany({ postId });
  }

  /**
   * Build translation map for efficient lookup
   */
  buildTranslationMap(translations: any[]): Record<string, any> {
    return translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Apply translations to a list of items
   */
  applyTranslationsToList<T extends { _id: string }>(
    items: T[],
    translations: any[],
    fieldMappings: TranslationFieldMapping
  ): T[] {
    if (!translations.length) return items;

    const translationMap = this.buildTranslationMap(translations);

    return items.map((item) => {
      const translation = translationMap[item._id.toString()];
      if (!translation) return item;

      return this.applyTranslationToItem(item, translation, fieldMappings);
    });
  }

  /**
   * Apply translation to a single item
   */
  applyTranslationToItem<T extends { _id: string }>(
    item: T,
    translation: any,
    fieldMappings: TranslationFieldMapping
  ): T {
    if (!translation) return item;

    const translatedItem = { ...item };
   Object.entries(fieldMappings).forEach(([originalField, translationField]) => {
      if (Object.prototype.hasOwnProperty.call(translation, translationField) && translation[translationField] !== undefined) {
        (translatedItem as any)[originalField] = translation[translationField];
      }
    });

    return translatedItem;
  }

  /**
   * Check if portal language matches requested language
   */
  async shouldSkipTranslation(
    clientPortalId: string,
    language: string
  ): Promise<boolean> {
    if (!clientPortalId || !language) return true;

    const config = await this.models.Portals.findOne({ _id: clientPortalId }).lean();
    return !config || config.language === language;
  }

  /**
   * Get model by type for translation operations
   */
  getModelByType(type: string): any {
    const modelMap: Record<string, any> = {
      post: this.models.Posts,
      page: this.models.Pages,
      category: this.models.Categories,
      tag: this.models.PostTags,
      menu: this.models.MenuItems,
      knowledgeBaseCategory: this.models.KnowledgeBaseCategories,
      knowledgeBaseTopic: this.models.KnowledgeBaseTopics,
      knowledgeBaseArticle: this.models.KnowledgeBaseArticles,
    };

    return modelMap[type];
  }

  /**
   * Validate translation input
   */
  validateTranslationInput(input: any): void {
    if (!input.type) {
      throw new Error('Translation type is required');
    }

    if (!input.postId) {
      throw new Error('Post ID is required');
    }

    if (!input.language) {
      throw new Error('Language is required');
    }

    const model = this.getModelByType(input.type);
    if (!model) {
      throw new Error(`Invalid translation type: ${input.type}`);
    }
  }
}

/**
 * Common field mappings for different entity types
 */
export const TRANSLATION_FIELD_MAPPINGS: Record<string, TranslationFieldMapping> = {
  POST: {
    title: 'title',
    content: 'content',
    excerpt: 'excerpt',
    customFieldsData: 'customFieldsData',
  },
  CATEGORY: {
    name: 'title',
    description: 'content',
  },
  PAGE: {
    name: 'title',
    description: 'content',
  },
  KNOWLEDGE_BASE_ARTICLE: {
    title: 'title',
    content: 'content',
    summary: 'excerpt',
  },
  KNOWLEDGE_BASE_CATEGORY: {
    title: 'title',
    description: 'content',
  },
  KNOWLEDGE_BASE_TOPIC: {
    title: 'title',
    description: 'content',
  },
} as const;

/**
 * Factory function to get translation service
 */
export function getTranslationService(models: IModels): TranslationService {
  return new TranslationService(models);
}
