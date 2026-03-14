import { cursorPaginate, defaultPaginate } from 'erxes-api-shared/utils';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';
import { IContext, IModels } from '~/connectionResolvers';
import { SortOrder } from 'mongoose';

export interface BaseQueryArgs {
  searchValue?: string;
  language?: string;
  clientPortalId?: string;
  status?: string;
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  orderBy?: Record<string, SortOrder>;
  sortField?: string;
  sortDirection?: string;
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

  protected buildTranslationMap(translations: any[]): Record<string, any> {
    return translations.reduce(
      (acc, translation) => {
        acc[translation.objectId.toString()] = translation;
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  protected applyTranslationsToList<T extends { _id: string }>(
    items: T[],
    translations: any[],
    fieldMappings: Record<string, string>,
  ): T[] {
    if (!translations.length) return items;

    const translationMap = this.buildTranslationMap(translations);

    return items.map((item) => {
      const translation = translationMap[item._id.toString()];
      if (!translation) return item;

      const translatedItem = { ...item };
      Object.entries(fieldMappings).forEach(
        ([originalField, translationField]) => {
          if (
            Object.prototype.hasOwnProperty.call(
              translation,
              translationField,
            ) &&
            translation[translationField] !== undefined &&
            translation[translationField] !== null &&
            translation[translationField] !== ''
          ) {
            (translatedItem as any)[originalField] =
              translation[translationField];
          }
        },
      );

      return translatedItem;
    });
  }

  protected applyTranslationsToItem<T extends { _id: string }>(
    item: T,
    translation: any,
    fieldMappings: Record<string, string>,
  ): T {
    if (!translation) return item;

    const translatedItem = { ...item };
    Object.entries(fieldMappings).forEach(
      ([originalField, translationField]) => {
        if (
          Object.prototype.hasOwnProperty.call(translation, translationField) &&
          translation[translationField] !== undefined &&
          translation[translationField] !== null &&
          translation[translationField] !== ''
        ) {
          (translatedItem as any)[originalField] =
            translation[translationField];
        }
      },
    );

    return translatedItem;
  }

  protected async getTranslations(
    itemIds: string[],
    language: string,
    type = 'post',
  ): Promise<any[]> {
    return this.models.Translations.find({
      objectId: { $in: itemIds },
      language,
      type,
    }).lean();
  }

  protected async getTranslation(
    itemId: string,
    language: string,
    type = 'post',
  ): Promise<any> {
    return this.models.Translations.findOne({
      objectId: itemId,
      language,
      type,
    }).lean();
  }

  protected async shouldSkipTranslation(
    clientPortalId: string,
    language: string,
  ): Promise<boolean> {
    if (!clientPortalId || !language) return true;

    const cms = await this.models.CMS.findOne({ clientPortalId }).lean();

    return !cms || cms.language === language;
  }

  private resolveClientPortalId(args: BaseQueryArgs): string {
    return args.clientPortalId || this.context.clientPortal?._id || '';
  }

  protected async getListWithTranslations<T extends { _id: string }>(
    model: any,
    query: any,
    args: BaseQueryArgs,
    fieldMappings: Record<string, string>,
    translationType = 'post',
  ): Promise<{ list: T[]; totalCount: number; pageInfo: any }> {
    const params = { ...args };
    if (args.sortField && !args.orderBy) {
      const sortOrder: SortOrder = args.sortDirection === 'asc' ? 1 : -1;
      params.orderBy = { [args.sortField]: sortOrder };
    }

    const { list, totalCount, pageInfo } = await cursorPaginate<any>({
      model,
      params,
      query,
    });

    if (!args.language) {
      return { list, totalCount, pageInfo };
    }

    const clientPortalId = this.resolveClientPortalId(args);

    if (!clientPortalId) {
      return { list, totalCount, pageInfo };
    }

    const shouldSkip = await this.shouldSkipTranslation(
      clientPortalId,
      args.language,
    );

    if (shouldSkip) {
      return { list, totalCount, pageInfo };
    }

    const itemIds = list.map((item: any) => item._id.toString());
    const translations = await this.getTranslations(
      itemIds,
      args.language,
      translationType,
    );
    const translatedList = this.applyTranslationsToList(
      list,
      translations,
      fieldMappings,
    );

    return { list: translatedList, totalCount, pageInfo };
  }

  protected async getListWithDefaultPagination<T extends { _id: string }>(
    model: any,
    query: any,
    args: BaseQueryArgs,
    fieldMappings: Record<string, string>,
    translationType = 'post',
  ): Promise<T[]> {
    const {
      sortField = 'scheduledDate',
      sortDirection,
      page = 1,
      perPage = 20,
    } = args;
    const sortOrder: SortOrder = sortDirection === 'asc' ? 1 : -1;

    const list = (await defaultPaginate(
      model
        .find(query)
        .sort({ [sortField]: sortOrder })
        .lean(),
      { page, perPage },
    )) as T[];

    if (!args.language) {
      return list;
    }

    const clientPortalId = this.resolveClientPortalId(args);

    if (!clientPortalId) {
      return list;
    }

    const shouldSkip = await this.shouldSkipTranslation(
      clientPortalId,
      args.language,
    );

    if (shouldSkip) {
      return list;
    }

    const itemIds = list.map((item) => item._id.toString());
    const translations = await this.getTranslations(
      itemIds,
      args.language,
      translationType,
    );
    const translatedList = this.applyTranslationsToList(
      list,
      translations,
      fieldMappings,
    );

    return translatedList;
  }

  /**
   * Fetch a single item and overlay its translation.
   * clientPortalId is taken from args when present (cms admin),
   * falling back to context.clientPortal._id (client portal).
   */
  protected async getItemWithTranslation<T>(
    model: any,
    query: any,
    language: string,
    fieldMappings: Record<string, string>,
    clientPortalId?: string,
    translationType = 'post',
  ): Promise<T | null> {
    const item = await model.findOne(query).lean();
    if (!item) return null;

    if (!language) return item;

    const effectiveClientPortalId =
      clientPortalId ||
      (item as any).clientPortalId ||
      this.context.clientPortal?._id ||
      '';

    if (!effectiveClientPortalId) return item;

    const shouldSkip = await this.shouldSkipTranslation(
      effectiveClientPortalId,
      language,
    );

    if (shouldSkip) return item;

    const translation = await this.getTranslation(
      item._id.toString(),
      language,
      translationType,
    );
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

  protected async create<T>(
    model: any,
    input: any,
    userId?: string,
  ): Promise<T> {
    if (userId) {
      input.createdUserId = userId;
    }

    if (this.context.clientPortal._id) {
      input.clientPortalId = this.context.clientPortal._id;
    }

    return model.createDoc
      ? model.createDoc(input, userId)
      : model.create(input);
  }

  protected async update<T>(
    model: any,
    id: string,
    input: any,
    userId?: string,
  ): Promise<T> {
    if (this.context.clientPortal._id) {
      input.clientPortalId = this.context.clientPortal._id;
    }

    return model.updateDoc
      ? model.updateDoc(id, input, userId)
      : model.updateOne({ _id: id }, input);
  }

  protected async remove<T>(model: any, id: string): Promise<T> {
    return model.removeDoc ? model.removeDoc(id) : model.deleteOne({ _id: id });
  }

  protected applyPermissions(
    mutations: any,
    permission: string,
    requireLoginFields: string[] = [],
  ): void {
    requireLoginFields.forEach((field) => {
      requireLogin(mutations, field);
    });

    Object.keys(mutations).forEach((field) => {
      checkPermission(mutations, field, permission, []);
    });
  }
}

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
  MENU: {
    label: 'title',
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
