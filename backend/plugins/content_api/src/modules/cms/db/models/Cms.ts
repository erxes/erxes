import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  CMS_DEFAULT_POST_URL_FIELD,
  CMS_DEFAULT_POST_URL_PREFIX,
  CMS_POST_URL_FIELDS,
  CMSPostUrlField,
  IContentCMSDocument,
  IContentCMSInput,
} from '@/cms/@types/cms';
import { cmsSchema } from '@/cms/db/definitions/cms';
import { getCmsDefaultLanguage } from '@/cms/utils/common';

/**
 * Content whose translatable fields live in the base document for the default
 * language and in the `Translations` collection for every other language. The
 * `fieldMappings` mirror `FIELD_MAPPINGS` in cms/utils/base-resolvers.ts
 * (base document field -> translation document field) so re-homing stays in
 * sync with how the read path overlays translations.
 */
type TranslatableContentConfig = {
  type: string;
  modelKey: 'Posts' | 'Categories' | 'PostTags' | 'Pages' | 'MenuItems';
  fieldMappings: Record<string, string>;
};

const TRANSLATABLE_CONTENT_TYPES: TranslatableContentConfig[] = [
  {
    type: 'post',
    modelKey: 'Posts',
    fieldMappings: {
      title: 'title',
      content: 'content',
      excerpt: 'excerpt',
      customFieldsData: 'customFieldsData',
    },
  },
  {
    type: 'category',
    modelKey: 'Categories',
    fieldMappings: {
      name: 'title',
      description: 'content',
      customFieldsData: 'customFieldsData',
    },
  },
  {
    type: 'tag',
    modelKey: 'PostTags',
    fieldMappings: { name: 'title' },
  },
  {
    type: 'page',
    modelKey: 'Pages',
    fieldMappings: {
      name: 'title',
      description: 'content',
      customFieldsData: 'customFieldsData',
    },
  },
  {
    type: 'menu',
    modelKey: 'MenuItems',
    fieldMappings: { label: 'title' },
  },
];

const IMPLIED_BASE_LANGUAGE = 'en';

const hasTranslatableValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Build the bulk-write operations for a single document when its site's default
 * language changes: preserve the old-default base content as an old-language
 * translation, promote the new-language translation into the base fields, and
 * drop the now-redundant new-language translation. Pulled out of
 * `rehomeDefaultLanguageContent` to keep that function's complexity in check.
 */
const buildRehomeOpsForDocument = (
  doc: any,
  fieldMappings: Record<string, string>,
  oldLanguage: string,
  newLanguage: string,
  type: string,
  newTranslation?: any,
  savedOldTranslation?: any,
): { translationOps: any[]; documentOp: Record<string, any> } => {
  const objectId = String(doc._id);
  const translationOps: any[] = [];

  // 1. Preserve the current (old-default) base content as an old-language
  //    translation so it remains reachable after the switch.
  const oldTranslationFields: Record<string, any> = {};
  for (const [baseField, translationField] of Object.entries(fieldMappings)) {
    oldTranslationFields[translationField] = hasTranslatableValue(
      savedOldTranslation?.[translationField],
    )
      ? savedOldTranslation[translationField]
      : (doc[baseField] ?? '');
  }

  translationOps.push({
    updateOne: {
      filter: { objectId, language: oldLanguage, type },
      update: {
        $set: { ...oldTranslationFields, objectId, language: oldLanguage, type },
      },
      upsert: true,
    },
  });

  // 2. Replace the base fields with the new language's content. Unlike the
  //    read-time overlay (which falls back to the default for empty values),
  //    promoting a language must NOT inherit the old default's content: a field
  //    the new language left empty has to become empty, otherwise the previous
  //    default's text leaks into the new default. Missing/empty values are reset
  //    to an empty value matching the field's shape (array vs. string).
  const baseUpdate: Record<string, any> = {};
  for (const [baseField, translationField] of Object.entries(fieldMappings)) {
    const value = newTranslation?.[translationField];
    const emptyValue = Array.isArray(doc[baseField]) ? [] : '';
    const fallbackValue =
      oldLanguage === newLanguage ? (doc[baseField] ?? emptyValue) : emptyValue;
    baseUpdate[baseField] = hasTranslatableValue(value) ? value : fallbackValue;
  }

  const documentOp = {
    updateOne: { filter: { _id: doc._id }, update: { $set: baseUpdate } },
  };

  // 3. The new language now lives in the base fields, so its standalone
  //    translation record is redundant.
  translationOps.push({
    deleteOne: { filter: { objectId, language: newLanguage, type } },
  });

  return { translationOps, documentOp };
};

/**
 * Move content between the base document and the `Translations` collection when
 * a site's default language changes. Without this, the old default's content is
 * stranded in the base fields (with no translation pointing to it) while the new
 * default's translation is ignored, so editors see content "disappear".
 */
const rehomeDefaultLanguageContent = async (
  models: IModels,
  clientPortalId: string,
  oldLanguage: string,
  newLanguage: string,
  isImpliedDefault: boolean,
) => {
  for (const { type, modelKey, fieldMappings } of TRANSLATABLE_CONTENT_TYPES) {
    const model = models[modelKey] as any;
    const documents = await model.find({ clientPortalId }).lean();

    if (!documents.length) {
      continue;
    }

    const objectIds = documents.map((doc: any) => String(doc._id));
    const translations = await models.Translations.find({
      objectId: { $in: objectIds },
      language: { $in: [oldLanguage, newLanguage, IMPLIED_BASE_LANGUAGE] },
      type,
    }).lean();

    const translationMap = new Map<string, any>(
      translations.map((translation: any) => [
        `${translation.objectId}:${translation.language}`,
        translation,
      ]),
    );

    const translationOps: any[] = [];
    const documentOps: any[] = [];

    for (const doc of documents) {
      const baseLanguage =
        isImpliedDefault && translationMap.has(`${doc._id}:${oldLanguage}`)
          ? IMPLIED_BASE_LANGUAGE
          : oldLanguage;
      const newTranslation = translationMap.get(`${doc._id}:${newLanguage}`);

      if (baseLanguage === newLanguage && !newTranslation) {
        continue;
      }

      const { translationOps: docTranslationOps, documentOp } =
        buildRehomeOpsForDocument(
          doc,
          fieldMappings,
          baseLanguage,
          newLanguage,
          type,
          newTranslation,
          isImpliedDefault
            ? translationMap.get(`${doc._id}:${baseLanguage}`)
            : undefined,
        );

      translationOps.push(...docTranslationOps);
      documentOps.push(documentOp);
    }

    if (!documentOps.length && !translationOps.length) {
      continue;
    }

    // NOTE: base documents and their translations live in separate
    // collections. We intentionally do not wrap these in a transaction —
    // the deployment's MongoDB may not be a replica set, and a session-bound
    // write buffers and times out there ("buffering timed out after 10000ms").
    if (documentOps.length) {
      await model.bulkWrite(documentOps);
    }
    if (translationOps.length) {
      await models.Translations.bulkWrite(translationOps);
    }
  }
};

export interface ICMSModel extends Model<IContentCMSDocument> {
  getContentCMS(_id: string): Promise<IContentCMSDocument>;
  getContentCMSs(): Promise<IContentCMSDocument[]>;
  createContentCMS(doc: IContentCMSInput): Promise<IContentCMSDocument>;
  updateContentCMS(
    _id: string,
    doc: IContentCMSInput,
  ): Promise<IContentCMSDocument>;
  deleteContentCMS(_id: string): Promise<boolean>;
}

export const loadCmsClass = (models: IModels) => {
  class CMS {
    private static normalizePostUrlField(
      postUrlField?: string,
    ): CMSPostUrlField {
      if (
        postUrlField &&
        CMS_POST_URL_FIELDS.includes(postUrlField as CMSPostUrlField)
      ) {
        return postUrlField as CMSPostUrlField;
      }

      return CMS_DEFAULT_POST_URL_FIELD;
    }

    private static normalizePostUrlPrefix(postUrlPrefix?: string): string {
      const trimmedValue = postUrlPrefix?.trim();

      if (!trimmedValue) {
        return CMS_DEFAULT_POST_URL_PREFIX;
      }

      const withLeadingSlash = trimmedValue.startsWith('/')
        ? trimmedValue
        : `/${trimmedValue}`;

      return withLeadingSlash.replace(/\/+$/g, '');
    }

    private static buildCmsDoc(doc: IContentCMSInput) {
      if (doc.postUrlField === undefined && doc.postUrlPrefix === undefined) {
        return doc;
      }

      return {
        ...doc,
        ...(doc.postUrlField === undefined
          ? {}
          : { postUrlField: this.normalizePostUrlField(doc.postUrlField) }),
        ...(doc.postUrlPrefix === undefined
          ? {}
          : { postUrlPrefix: this.normalizePostUrlPrefix(doc.postUrlPrefix) }),
      };
    }

    public static async getContentCMS(_id: string) {
      return models.CMS.findOne({ _id });
    }
    public static async getContentCMSs() {
      const data = await models.CMS.find();
      return data;
    }
    public static async createContentCMS(doc: IContentCMSInput) {
      return models.CMS.create(this.buildCmsDoc(doc));
    }
    public static async updateContentCMS(_id: string, doc: IContentCMSInput) {
      const existing = await models.CMS.findOne({ _id }).lean();

      const previousLanguage = getCmsDefaultLanguage(existing);
      const nextLanguage = doc.language;
      const isImpliedDefault = !existing?.language;

      // Default language changed: re-home content so nothing disappears.
      if (
        existing?.clientPortalId &&
        previousLanguage &&
        nextLanguage &&
        (isImpliedDefault || previousLanguage !== nextLanguage)
      ) {
        await rehomeDefaultLanguageContent(
          models,
          existing.clientPortalId,
          previousLanguage,
          nextLanguage,
          isImpliedDefault,
        );
      }

      return models.CMS.findOneAndUpdate({ _id }, this.buildCmsDoc(doc), {
        new: true,
      });
    }
    public static async deleteContentCMS(_id: string) {
      return models.CMS.findOneAndDelete({ _id });
    }
  }
  cmsSchema.loadClass(CMS);

  return cmsSchema;
};
