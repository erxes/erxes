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
};
