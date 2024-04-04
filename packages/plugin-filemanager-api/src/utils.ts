import { sendCoreMessage } from './messageBroker';
import { IFolderDocument } from './models';

export const checkFilePermission = async ({
  file,
  models,
  subdomain,
  user
}): Promise<IFolderDocument> => {
  const units = await sendCoreMessage({
    subdomain,
    action: 'units.find',
    data: {
      userIds: { $in: user._id }
    },
    isRPC: true
  });

  const unitIds = units.map(u => u._id);

  const folder = await models.Folders.getFolder({ _id: file.folderId });

  if (
    unitIds.includes(folder.permissionUnitId) ||
    (folder.permissionUserIds || []).includes(user._id)
  ) {
    return file;
  }

  if (
    file.createdUserId === user._id ||
    (file.permissionUserIds || []).includes(user._id) ||
    units.map(u => u._id).includes(file.permissionUnitId || [])
  ) {
    return file;
  }

  throw new Error('Permission denied');
};
