// TODO: check if related stages are selected in client portal config

import { IContext } from '../../../connectionResolver';

const clientPortalUserQueries = {
  async clientPortalUserDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ClientPortalUsers.getUser({ _id });
  },

  async clientPortalCurrentUser(_root, _args, context: IContext) {
    const { cpUser } = context;

    return cpUser
      ? context.models.ClientPortalUsers.getUser({ _id: cpUser._id })
      : null;
  }
};

export default clientPortalUserQueries;
