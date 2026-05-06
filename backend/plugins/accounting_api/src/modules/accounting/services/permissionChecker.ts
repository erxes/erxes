import { Model } from 'mongoose';
import { IPermissionDocument } from '~/modules/accounting/@types/permission';

export async function checkAccountingPermission(
  userId: string,
  accountId: string,
  targetRecord: { createdBy?: string; modifiedBy?: string },
  models: {
    Permissions: Model<IPermissionDocument>;
    Configs: Model<any>;  
  },
  getUserLevel: (userId: string) => Promise<number>,
) {
  // 1. Fetch dominant user lists from Configs collection
  const readConfig = await models.Configs.findOne({
    code: 'accountingDominantRead',
    subId: accountId,
  }).lean();
  const writeConfig = await models.Configs.findOne({
    code: 'accountingDominantWrite',
    subId: accountId,
  }).lean();

  // Cast to any to access .value.userIds safely
  const readDominantUserIds = (readConfig as any)?.value?.userIds || [];
  const writeDominantUserIds = (writeConfig as any)?.value?.userIds || [];

  if (readDominantUserIds.includes(userId)) {
    return { canRead: true, canWrite: true };
  }
  if (writeDominantUserIds.includes(userId)) {
    return { canRead: true, canWrite: true };
  }

  // 2. Permission record (from the Permissions collection)
  const perm = await models.Permissions.findOne({ userId, accountId }).lean() as
    | { level: number; read: string; write: string }
    | null;
  if (!perm) return { canRead: false, canWrite: false };

  const targetUserId = targetRecord.modifiedBy || targetRecord.createdBy;
  if (!targetUserId) return { canRead: false, canWrite: false };

  const targetLevel = await getUserLevel(targetUserId);
  const actorLevel = perm.level;

  // 3. Evaluate read rule
  let canRead = false;
  switch (perm.read) {
    case 'own':
      canRead = targetUserId === userId;
      break;
    case 'ltLvl':
      canRead = targetLevel < actorLevel;
      break;
    case 'lteLvl':
      canRead = targetLevel <= actorLevel;
      break;
    case 'gtLvl':
      canRead = targetLevel > actorLevel;
      break;
    default:
      canRead = false;
  }

  // 4. Evaluate write rule
  let canWrite = false;
  switch (perm.write) {
    case 'add':
      canWrite = true;
      break;
    case 'own':
      canWrite = targetUserId === userId;
      break;
    case 'ltLvl':
      canWrite = targetLevel < actorLevel;
      break;
    case 'lteLvl':
      canWrite = targetLevel <= actorLevel;
      break;
    case 'gtLvl':
      canWrite = targetLevel > actorLevel;
      break;
    default:
      canWrite = false;
  }

  if (canWrite && ['own', 'ltLvl', 'lteLvl', 'gtLvl'].includes(perm.write)) {
    canRead = true;
  }

  return { canRead, canWrite };
}