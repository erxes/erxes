import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { IFolderDocument } from '../../models';

const sharedUsers = async (root, _args, { models, subdomain }: IContext) => {
  let sharedUsers = root.permissionUserIds || [];

  if (root.permissionUnitId) {
    const unit = await sendCoreMessage({
      subdomain,
      action: 'units.findOne',
      data: {
        _id: root.permissionUnitId
      },
      isRPC: true
    });

    sharedUsers = [...sharedUsers, ...(unit.userIds || [])];
  }

  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        _id: { $in: sharedUsers }
      }
    },
    isRPC: true
  });

  return users;
};

export const folder = {
  async parent(root: IFolderDocument, _args, { models }: IContext) {
    if (!root.parentId) {
      return null;
    }

    return models.Folders.findOne({ _id: root.parentId });
  },

  async hasChild(root: IFolderDocument, _args, { models }: IContext) {
    const count = await models.Folders.find({ parentId: root._id }).count();

    return count > 0;
  },

  sharedUsers
};

export const file = {
  sharedUsers
};

export const log = {
  user(root) {
    return (
      root.userId && {
        __typename: 'User',
        _id: root.userId
      }
    );
  }
};
