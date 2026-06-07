import { IKhanbankConfig } from '@/corporateGateway/khanbank/@types/khanbank';
import { IContext } from '~/connectionResolvers';
import { getAuthHeaders } from '../../../khanbank/utils';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';

const mutations = {
  async khanbankConfigsAdd(_root, args: IKhanbankConfig, { models }: IContext) {
    const key = args.consumerKey;
    const secret = args.secretKey;

    try {
      await getAuthHeaders({
        consumerKey: key,
        secretKey: secret,
      });

      return models.KhanbankConfigs.createConfig(args);
    } catch (e) {
      throw new Error('Unable to authenticate with the provided credentials');
    }
  },

  async khanbankConfigsEdit(
    _root,
    args: {
      _id: string;
    } & IKhanbankConfig,
    { models }: IContext,
  ) {
    const key = args.consumerKey;
    const secret = args.secretKey;

    try {
      await getAuthHeaders({
        consumerKey: key,
        secretKey: secret,
      });

      return models.KhanbankConfigs.updateConfig(args._id, args);
    } catch (e) {
      throw new Error('Unable to authenticate with the provided credentials');
    }
  },

  async khanbankConfigsRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.KhanbankConfigs.removeConfig(_id);
  },
};
requireLogin(mutations, 'khanbankConfigsAdd');
requireLogin(mutations, 'khanbankConfigsEdit');
requireLogin(mutations, 'khanbankConfigsRemove');

checkPermission(mutations, 'khanbankConfigsAdd', 'khanbankConfigsAdd', []);
checkPermission(mutations, 'khanbankConfigsEdit', 'khanbankConfigsEdit', []);
checkPermission(
  mutations,
  'khanbankConfigsRemove',
  'khanbankConfigsRemove',
  [],
);

export default mutations;
