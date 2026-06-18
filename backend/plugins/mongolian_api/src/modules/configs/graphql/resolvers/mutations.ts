import { IContext } from '~/connectionResolvers';
import { MnConfigCodes } from '../../@types/configs';

export const mnConfigMutations = {
  async mnConfigsCreate(
    _root,
    { code, value, subId }: { code: string; value: any; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageMnConfig');

    if (!MnConfigCodes.includes(code)) {
      throw new Error(`Not Valid Code`);
    }
    return await models.Configs.createConfig({ code, subId, value });
  },

  async mnConfigsUpdate(
    _root,
    { _id, value, subId }: { _id: string; value: any; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageMnConfig');

    return await models.Configs.updateConfig(_id, value, subId);
  },

  async mnConfigsRemove(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageMnConfig');

    return await models.Configs.removeConfig(_id);
  },
};