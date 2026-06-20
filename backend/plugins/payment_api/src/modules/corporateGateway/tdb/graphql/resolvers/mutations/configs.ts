import { ITdbConfig } from '../../../@types/tdb';
import { IContext } from '~/connectionResolvers';


const mutations = {
  async tdbConfigsAdd(_root, args: ITdbConfig, { models }: IContext) {
    return models.TdbConfigs.createConfig(args);
  },

  async tdbConfigsEdit(
    _root,
    args: { _id: string } & ITdbConfig,
    { models }: IContext,
  ) {
    return models.TdbConfigs.updateConfig(args._id, args);
  },

  async tdbConfigsRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.TdbConfigs.removeConfig(_id);
  },
};


export default mutations;