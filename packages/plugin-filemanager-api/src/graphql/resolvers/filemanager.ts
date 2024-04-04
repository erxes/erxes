import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import {
  IAccessRequestDocument,
  IAckRequestDocument,
  IFileDocument,
  IFolderDocument,
  IRelationDocument
} from '../../models';

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
  sharedUsers,

  async relatedFiles(root: IFileDocument, _args, { models }: IContext) {
    return models.Files.find({
      $or: [
        { _id: root.relatedFileIds || [] },
        { relatedFileIds: { $in: [root._id] } }
      ]
    });
  }
};

export const accessRequest = {
  async file(root: IAccessRequestDocument, _args, { models }: IContext) {
    return models.Files.findOne({ _id: root.fileId });
  },

  fromUser(root: IAccessRequestDocument) {
    return (
      root.fromUserId && {
        __typename: 'User',
        _id: root.fromUserId
      }
    );
  }
};

export const ackRequest = {
  async file(root: IAckRequestDocument, _args, { models }: IContext) {
    return models.Files.findOne({ _id: root.fileId });
  },

  fromUser(root: IAckRequestDocument) {
    return (
      root.fromUserId && {
        __typename: 'User',
        _id: root.fromUserId
      }
    );
  },

  toUser(root: IAckRequestDocument) {
    return (
      root.toUserId && {
        __typename: 'User',
        _id: root.toUserId
      }
    );
  }
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

export const relation = {
  async files(root: IRelationDocument, _args, { models }: IContext) {
    return models.Files.find({ _id: { $in: root.fileIds || [] } });
  }
};
