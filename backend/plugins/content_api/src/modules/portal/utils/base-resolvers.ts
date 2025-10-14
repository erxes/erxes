import { cursorPaginate } from 'erxes-api-shared/utils';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';
import { IContext, IModels } from '~/connectionResolvers';
import { SortOrder } from 'mongoose';

export interface BaseQueryArgs  {
  searchValue?: string;
  language?: string;
  clientPortalId?: string;
  status?: string;
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  orderBy?: Record<string, SortOrder>;
  [key: string]: any;
}

export interface BaseMutationArgs {
  _id?: string;
  input: any;
}

export interface TranslationFields {
  title?: string;
  content?: string;
  excerpt?: string;
  description?: string;
  customFieldsData?: any;
}

export class BaseQueryResolver {
  protected models: IModels;
  protected context: IContext;

  constructor(context: IContext) {
    this.models = context.models;
    this.context = context;
  }

  /**
   * Build translation map for efficient lookup
   */
  protected buildTranslationMap(translations: any[]): Record<string, any> {
    return translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Apply translations to a list of items
   */
  protected applyTranslationsToList<T extends { _id: string }>(
    items: T[],
    translations: any[],
    fieldMappings: Record<string, string>
  ): T[] {
    if (!translations.length) return items;

    const translationMap = this.buildTranslationMap(translations);

    return items.map((item) => {
      const translation = translationMap[item._id.toString()];
      if (!translation) return item;

      const translatedItem = { ...item };
     Object.entries(fieldMappings).forEach(([originalField, translationField]) => {
      if (Object.prototype.hasOwnProperty.call(translation, translationField) && translation[translationField] !== undefined) {
        (translatedItem as any)[originalField] = translation[translationField];
      }
    });

      return translatedItem;
    });
  }

  /**
   * Apply translations to a single item
   */
  protected applyTranslationsToItem<T extends { _id: string }>(
    item: T,
    translation: any,
    fieldMappings: Record<string, string>
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
   * Get translations for items
   */
  protected async getTranslations(
    itemIds: string[],
    language: string
  ): Promise<any[]> {
    return this.models.Translations.find({
      postId: { $in: itemIds },
      language,
    }).lean();
  }

  /**
   * Get translation for single item
   */
  protected async getTranslation(
    itemId: string,
    language: string
  ): Promise<any> {
    return this.models.Translations.findOne({
      postId: itemId,
      language,
    }).lean();
  }

  /**
   * Check if portal language matches requested language
   */
  protected async shouldSkipTranslation(
    clientPortalId: string,
    language: string
  ): Promise<boolean> {
    if (!clientPortalId || !language) return true;

    const config = await this.models.Portals.findOne({ _id: clientPortalId }).lean();
    return !config || config.language === language;
  }

  /**
   * Generic list query with translation support
   */
  protected async getListWithTranslations<T extends { _id: string }>(
    model: any,
    query: any,
    args: BaseQueryArgs,
    fieldMappings: Record<string, string>
  ): Promise<{ list: T[]; totalCount: number; pageInfo: any }> {
    const { list, totalCount, pageInfo } = await cursorPaginate<any>({
      model,
      params: args,
      query,
    });

    if (!args.language) {
      return { list, totalCount, pageInfo };
    }

    if (!args.clientPortalId && !this.context.clientPortalId) {
      throw new Error('Client portal ID is required');
    }

    const shouldSkip = await this.shouldSkipTranslation(
      args.clientPortalId || this.context.clientPortalId || '',
      args.language || ''
    );

    if (shouldSkip) {
      return { list, totalCount, pageInfo };
    }

    const itemIds = list.map((item: any) => item._id);
    const translations = await this.getTranslations(itemIds, args.language);
    const translatedList = this.applyTranslationsToList(list, translations, fieldMappings);

    return { list: translatedList, totalCount, pageInfo };
  }

  /**
   * Generic single item query with translation support
   */
  protected async getItemWithTranslation<T>(
    model: any,
    query: any,
    language: string,
    fieldMappings: Record<string, string>
  ): Promise<T | null> {
    const item = await model.findOne(query).lean();
    if (!item) return null;

    if (!language) return item;

    const shouldSkip = await this.shouldSkipTranslation(
      this.context.clientPortalId || '',
      language
    );

    if (shouldSkip) return item;

    const translation = await this.getTranslation(item._id, language);
    return this.applyTranslationsToItem(item, translation, fieldMappings);
  }
}

export class BaseMutationResolver {
  protected models: IModels;
  protected context: IContext;

  constructor(context: IContext) {
    this.models = context.models;
    this.context = context;
  }

  /**
   * Generic create operation
   */
  protected async create<T>(
    model: any,
    input: any,
    userId?: string
  ): Promise<T> {
    if (userId) {
      input.createdUserId = userId;
    }

    if (this.context.clientPortalId) {
      input.clientPortalId = this.context.clientPortalId;
    }

    return model.createDoc ? model.createDoc(input, userId) : model.create(input);
  }

  /**
   * Generic update operation
   */
  protected async update<T>(
    model: any,
    id: string,
    input: any,
    userId?: string
  ): Promise<T> {
    if (this.context.clientPortalId) {
      input.clientPortalId = this.context.clientPortalId;
    }

    return model.updateDoc ? model.updateDoc(id, input, userId) : model.updateOne({ _id: id }, input);
  }

  /**
   * Generic delete operation
   */
  protected async remove<T>(model: any, id: string): Promise<T> {
    return model.removeDoc ? model.removeDoc(id) : model.deleteOne({ _id: id });
  }

  /**
   * Apply permission checks to mutations
   */
  protected applyPermissions(
    mutations: any,
    permission: string,
    requireLoginFields: string[] = []
  ): void {
    requireLoginFields.forEach(field => {
      requireLogin(mutations, field);
    });

    Object.keys(mutations).forEach(field => {
      checkPermission(mutations, field, permission, []);
    });
  }
}

/**
 * Common field mappings for different entity types
 */
export const FIELD_MAPPINGS = {
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
