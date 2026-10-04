import {
  IPropertyMeta,
  IPropertySystemField,
  IPropertyType,
} from 'erxes-api-shared/core-modules';
import { getPlugin } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IResolvedSystemField,
  ISystemFieldConfig,
  ISystemFieldLogic,
  ISystemFieldSetting,
  ISystemFieldSettingDocument,
} from '~/modules/properties/@types';
import { systemFieldSettingSchema } from '~/modules/properties/db/definitions/systemField';

export interface ISystemFieldSettingModel extends Model<ISystemFieldSettingDocument> {
  getSystemFields(contentType: string): Promise<IResolvedSystemField[]>;
  getSystemFieldsLayout(contentType: string): Promise<string[][] | null>;
  saveSystemFieldsLayout(
    contentType: string,
    layout: string[][] | null,
    userId: string,
  ): Promise<string[][]>;
  updateSystemField(
    doc: ISystemFieldSetting,
    userId: string,
  ): Promise<IResolvedSystemField>;
}

const LOGIC_OPERATORS = ['is', 'isNot'];
const LOGIC_ACTIONS = ['show', 'hide'];

const getDeclaredType = async (
  contentType: string,
): Promise<IPropertyType | undefined> => {
  const [pluginName, type] = contentType.split(':');

  if (!pluginName || !type) {
    return undefined;
  }

  const plugin = await getPlugin(pluginName);
  const meta: IPropertyMeta | undefined = plugin?.config?.meta?.properties;

  return meta?.types.find((item) => item.type === type);
};

const getDeclaredSystemFields = async (
  contentType: string,
): Promise<IPropertySystemField[]> =>
  (await getDeclaredType(contentType))?.systemFields || [];

const toConfig = (
  field: IPropertySystemField,
  setting?: Partial<ISystemFieldConfig> | null,
): ISystemFieldConfig => ({
  isVisible: setting?.isVisible ?? !field.hiddenByDefault,
  isVisibleToCreate: field.notOnCreate
    ? false
    : (setting?.isVisibleToCreate ?? !!field.visibleToCreateByDefault),
  // A group or an always-filled field is never required on its own.
  isRequired:
    field.requiredGroup || field.alwaysFilled
      ? false
      : (setting?.isRequired ?? false),
  logics: setting?.logics ?? [],
});

const assertTogglesAllowed = (
  field: IPropertySystemField,
  { isRequired, isVisibleToCreate }: Partial<ISystemFieldConfig>,
) => {
  if (isRequired !== undefined && (field.requiredGroup || field.alwaysFilled)) {
    throw new Error(`"${field.name}" is not required on its own`);
  }

  if (isVisibleToCreate && field.notOnCreate) {
    throw new Error(`"${field.name}" cannot be set when creating`);
  }
};

const validateLogics = (logics?: ISystemFieldLogic[]) =>
  logics?.map(({ field, operator, value, action }) => {
    if (!field) {
      throw new Error('Logic rule field is required');
    }

    if (!LOGIC_OPERATORS.includes(operator)) {
      throw new Error(`Unsupported logic operator "${operator}"`);
    }

    if (!LOGIC_ACTIONS.includes(action)) {
      throw new Error(`Unsupported logic action "${action}"`);
    }

    return { field, operator, value: value ?? '', action };
  });

const omitUndefined = (doc: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(doc).filter(([, value]) => value !== undefined),
  );

export const loadSystemFieldSettingClass = (models: IModels) => {
  class SystemFieldSetting {
    public static async getSystemFields(contentType: string) {
      const systemFields = await getDeclaredSystemFields(contentType);

      if (!systemFields.length) {
        return [];
      }

      const settings = await models.SystemFieldSettings.find({
        contentType,
      }).lean();

      const settingByCode = new Map(
        settings.map((setting) => [setting.code, setting]),
      );

      return systemFields.map((field) => ({
        ...field,
        ...toConfig(field, settingByCode.get(field.code)),
      }));
    }

    // Null when the content type has not opened Basic information to layouts.
    public static async getSystemFieldsLayout(contentType: string) {
      const type = await getDeclaredType(contentType);

      if (!type?.systemFieldsLayout) {
        return null;
      }

      const saved = await models.SystemFieldLayouts.findOne({
        contentType,
      }).lean();

      return saved?.layout ?? type.systemFieldsLayout.defaultLayout;
    }

    // A null layout goes back to the one the content type declares.
    public static async saveSystemFieldsLayout(
      contentType: string,
      layout: string[][] | null,
      userId: string,
    ) {
      const type = await getDeclaredType(contentType);

      if (!type?.systemFieldsLayout) {
        throw new Error(
          `${contentType} does not lay out its basic information`,
        );
      }

      if (!layout) {
        await models.SystemFieldLayouts.deleteOne({ contentType });

        return type.systemFieldsLayout.defaultLayout;
      }

      const placeable = new Set(
        (type.systemFields ?? [])
          .filter((field) => !field.outsideLayout)
          .map((field) => field.code),
      );
      const unknown = layout.flat().find((code) => !placeable.has(code));

      if (unknown) {
        throw new Error(`"${unknown}" cannot be placed in the layout`);
      }

      const rows = layout.filter((row) => row.length);

      await models.SystemFieldLayouts.updateOne(
        { contentType },
        { $set: { layout: rows, updatedBy: userId } },
        { upsert: true },
      );

      return rows;
    }

    public static async updateSystemField(
      { contentType, code, logics, ...flags }: ISystemFieldSetting,
      userId: string,
    ) {
      const systemFields = await getDeclaredSystemFields(contentType);
      const systemField = systemFields.find((field) => field.code === code);

      if (!systemField) {
        throw new Error(`System field "${code}" not found on ${contentType}`);
      }

      assertTogglesAllowed(systemField, flags);

      // The last field of a group on the create form keeps the group fillable.
      if (systemField.requiredGroup && flags.isVisibleToCreate === false) {
        const resolved =
          await models.SystemFieldSettings.getSystemFields(contentType);
        const othersShown = resolved.some(
          (field) =>
            field.requiredGroup === systemField.requiredGroup &&
            field.code !== code &&
            field.isVisibleToCreate,
        );

        if (!othersShown) {
          throw new Error(
            'At least one of these fields must stay on the create form',
          );
        }
      }

      const setting = await models.SystemFieldSettings.findOneAndUpdate(
        { contentType, code },
        {
          $set: {
            ...omitUndefined({ ...flags, logics: validateLogics(logics) }),
            updatedBy: userId,
          },
        },
        { upsert: true, new: true },
      ).lean();

      return { ...systemField, ...toConfig(systemField, setting) };
    }
  }

  systemFieldSettingSchema.loadClass(SystemFieldSetting);

  return systemFieldSettingSchema;
};
