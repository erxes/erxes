import { IContext } from '~/connectionResolvers';
import { ISystemFieldSetting } from '~/modules/properties/@types';

export const systemFieldMutations = {
  propertySystemFieldEdit: async (
    _root: undefined,
    doc: ISystemFieldSetting,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    return models.SystemFieldSettings.updateSystemField(doc, user._id);
  },
  propertySystemFieldsLayoutSave: async (
    _root: undefined,
    {
      contentType,
      layout,
    }: { contentType: string; layout?: string[][] | null },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    return models.SystemFieldSettings.saveSystemFieldsLayout(
      contentType,
      layout ?? null,
      user._id,
    );
  },
};
