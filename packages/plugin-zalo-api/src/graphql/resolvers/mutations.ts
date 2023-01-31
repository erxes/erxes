import { updateConfigs } from '../../server';
import { IContext, IModels } from '../../models';

const zaloMutations = {
  async zaloUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },

  async zaloRemoveAccount(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    await models.Accounts.deleteOne({ _id });

    return 'deleted';
  }
};

export default zaloMutations;
