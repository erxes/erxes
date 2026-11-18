import {
  IDataExtensionField,
  IDataExtensionFieldOption,
  IDataExtensionFieldSettings,
  IDataExtensionObject,
  isComputedField,
} from 'ui-modules';

/** A data model that can be exported, shared and applied to a workspace. */
export interface IDataModelTemplate {
  version: 1;
  name?: string;
  objects: {
    key: string;
    singularLabel: string;
    pluralLabel: string;
    description?: string;
    icon?: string;
  }[];
  fields: {
    recordType: string;
    key: string;
    label: string;
    description?: string;
    type: string;
    options?: IDataExtensionFieldOption[];
    settings?: IDataExtensionFieldSettings;
  }[];
  relations: {
    recordType: string;
    key: string;
    label: string;
    targetRecordType: string;
    kind: string;
    inverseKey: string;
    inverseLabel: string;
  }[];
}

export interface ITemplateApi {
  addObject: (input: IDataModelTemplate['objects'][number]) => Promise<unknown>;
  addField: (input: IDataModelTemplate['fields'][number]) => Promise<unknown>;
  addRelation: (input: IDataModelTemplate['relations'][number]) => Promise<unknown>;
}

export interface ITemplateResult {
  created: string[];
  skipped: string[];
  failed: { item: string; error: string }[];
}

const isCustom = (recordType: string) => recordType.startsWith('custom:');

/**
 * The definitions of the chosen record types as a template: their custom
 * objects, stored and computed fields, and each relation once, from the
 * side that stores it.
 */
export const buildDataModelTemplate = (
  recordTypes: string[],
  objects: IDataExtensionObject[],
  fields: IDataExtensionField[],
): IDataModelTemplate => {
  const chosen = new Set(recordTypes);
  const own = fields.filter((field) => chosen.has(field.recordType) && field.status === 'active');
  const inverseOf = new Map(fields.map((field) => [field._id, field]));

  return {
    version: 1,
    objects: objects
      .filter((object) => object.status === 'active' && chosen.has(object.recordType))
      .map(({ key, singularLabel, pluralLabel, description, icon }) => ({
        key,
        singularLabel,
        pluralLabel,
        ...(description ? { description } : {}),
        ...(icon ? { icon } : {}),
      })),
    fields: own
      .filter((field) => !field.relation)
      .map(({ recordType, key, label, description, type, options, settings }) => ({
        recordType,
        key,
        label,
        ...(description ? { description } : {}),
        type,
        ...(options?.length
          ? { options: options.map(({ value, label: optionLabel, color }) => ({ value, label: optionLabel, ...(color ? { color } : {}) })) }
          : {}),
        ...(settings && Object.keys(settings).length ? { settings } : {}),
      })),
    relations: own
      .filter((field) => field.relation?.side === 'source')
      .map((field) => {
        const inverse = field.relation?.inverseFieldId
          ? inverseOf.get(field.relation.inverseFieldId)
          : undefined;

        return {
          recordType: field.recordType,
          key: field.key,
          label: field.label,
          targetRecordType: field.relation?.targetRecordType as string,
          kind: field.relation?.kind as string,
          inverseKey: inverse?.key || `${field.key}Of`,
          inverseLabel: inverse?.label || field.label,
        };
      })
      // A relation is only portable when both ends are in the template or
      // are module record types every workspace has.
      .filter(
        (relation) =>
          !isCustom(relation.targetRecordType) || chosen.has(relation.targetRecordType),
      ),
  };
};

/** A loose shape check before anything is sent; the server validates fully. */
export const readDataModelTemplate = (text: string): IDataModelTemplate => {
  const parsed = JSON.parse(text);

  if (
    !parsed ||
    parsed.version !== 1 ||
    !Array.isArray(parsed.objects) ||
    !Array.isArray(parsed.fields) ||
    !Array.isArray(parsed.relations)
  ) {
    throw new Error('Not a data model template (version 1)');
  }

  return parsed as IDataModelTemplate;
};

const alreadyExists = (error: unknown) =>
  error instanceof Error && /already (exists|used)/i.test(error.message);

/**
 * Applies a template in dependency order: objects, stored fields,
 * relations, then computed fields (rollups need their relation). Items
 * that already exist are skipped, so applying twice is harmless.
 */
export const applyDataModelTemplate = async (
  template: IDataModelTemplate,
  api: ITemplateApi,
  onProgress?: (result: ITemplateResult) => void,
): Promise<ITemplateResult> => {
  const result: ITemplateResult = { created: [], skipped: [], failed: [] };
  const step = async (item: string, run: () => Promise<unknown>) => {
    try {
      await run();
      result.created.push(item);
    } catch (error) {
      if (alreadyExists(error)) {
        result.skipped.push(item);
      } else {
        result.failed.push({ item, error: error instanceof Error ? error.message : String(error) });
      }
    }

    onProgress?.({ ...result });
  };

  for (const object of template.objects) {
    await step(object.pluralLabel, () => api.addObject(object));
  }

  const stored = template.fields.filter((field) => !isComputedField(field as IDataExtensionField));
  const computed = template.fields.filter((field) => isComputedField(field as IDataExtensionField));

  for (const field of stored) {
    await step(`${field.recordType} · ${field.label}`, () => api.addField(field));
  }

  for (const relation of template.relations) {
    await step(`${relation.recordType} → ${relation.targetRecordType}`, () =>
      api.addRelation(relation),
    );
  }

  for (const field of computed) {
    await step(`${field.recordType} · ${field.label}`, () => api.addField(field));
  }

  return result;
};
