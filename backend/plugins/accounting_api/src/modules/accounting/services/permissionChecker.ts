import { Model } from 'mongoose';
import { IPermissionDocument } from '~/modules/accounting/@types/permission';

export async function checkAccountingPermission(
  userId: string,
  accountId: string,
  models: {
    Permissions: Model<IPermissionDocument>;
    Configs: Model<any>;
  },
) {
  // 1. Dominant user overrides
  const readConfig = await models.Configs.findOne({
    code: 'accountingDominantRead',
    subId: accountId,
  }).lean();
  const writeConfig = await models.Configs.findOne({
    code: 'accountingDominantWrite',
    subId: accountId,
  }).lean();

  const readDominantUserIds = (readConfig as any)?.value?.userIds || [];
  const writeDominantUserIds = (writeConfig as any)?.value?.userIds || [];

  if (readDominantUserIds.includes(userId) || writeDominantUserIds.includes(userId)) {
    return { canRead: true, canWrite: true };
  }

  // 2. Permission record
  const perm = await models.Permissions.findOne({ userId, accountId }).lean() as
    | { read: string; write: string }
    | null;
  if (!perm) return { canRead: false, canWrite: false };

  // 3. Simple account‑level check (no target record)
  const canRead = perm.read !== 'none';
  const canWrite = perm.write !== 'none';

  return { canRead, canWrite };
}