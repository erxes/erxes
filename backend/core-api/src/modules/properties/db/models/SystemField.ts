import {
  IPropertyMeta,
  IPropertySystemField,
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

export interface ISystemFieldSettingModel
  extends Model<ISystemFieldSettingDocument> {
  getSystemFields(contentType: string): Promise<IResolvedSystemField[]>;
  updateSystemField(
    doc: ISystemFieldSetting,
    userId: string,
  ): Promise<IResolvedSystemField>;
}

const LOGIC_OPERATORS = ['is', 'isNot'];
const LOGIC_ACTIONS = ['show', 'hide'];

const getDeclaredSystemFields = async (
  contentType: string,
): Promise<IPropertySystemField[]> => {
  const [pluginName, type] = contentType.split(':');

  if (!pluginName || !type) {
    return [];
  }

  const plugin = await getPlugin(pluginName);
  const meta: IPropertyMeta | undefined = plugin?.config?.meta?.properties;

  return meta?.types.find((item) => item.type === type)?.systemFields || [];
};

const toConfig = (
  setting?: Partial<ISystemFieldConfig> | null,
): ISystemFieldConfig => ({
  isVisible: setting?.isVisible ?? true,
  isVisibleToCreate: setting?.isVisibleToCreate ?? false,
  isRequired: setting?.isRequired ?? false,
  logics: setting?.logics ?? [],
});

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
        ...toConfig(settingByCode.get(field.code)),
      }));
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

      return { ...systemField, ...toConfig(setting) };
    }
  }

  systemFieldSettingSchema.loadClass(SystemFieldSetting);

  return systemFieldSettingSchema;
};
