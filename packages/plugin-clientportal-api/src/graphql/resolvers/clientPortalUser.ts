import { IContext } from '../../connectionResolver';

const ClientPortalUser = {
  clientPortal(user, _args, { models: { ClientPortals } }: IContext) {
    return (
      user.clientPortalId &&
      ClientPortals.findOne({
        _id: user.clientPortalId
      })
    );
  }
};

export { ClientPortalUser };
