// TODO: check if related stages are selected in client portal config

import { IContext } from '../../../connectionResolver';

const clientPortalUserQueries = {
  async clientPortalUserDetail(
    _root,
    { _id }: { _id: string },
    { cpModels }: IContext
  ) {
    return cpModels.ClientPortalUsers.getUser({ _id });
  },

  async clientPortalCurrentUser(_root, _args, context: IContext) {
    const { cpUser } = context;

    return cpUser
      ? context.cpModels.ClientPortalUsers.getUser({ _id: cpUser._id })
      : null;
  }
};

export default clientPortalUserQueries;
