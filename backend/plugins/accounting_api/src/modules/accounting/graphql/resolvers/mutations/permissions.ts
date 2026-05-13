import { IContext } from '~/connectionResolvers';

const mutationsAccountPermissions = {
  async setAccountPermissions(
    _root,
    { input }: { input: { accountIds: string[]; userId: string; level?: number; read?: string; write?: string } },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountPermissions');

    const { accountIds, userId, level, read, write } = input;

    // INPUT VALIDATION
    const validReadScopes = ['none', 'own', 'ltLvl', 'lteLvl', 'gtLvl'];
    const validWriteScopes = ['none', 'add', 'own', 'ltLvl', 'lteLvl', 'gtLvl'];

    if (read !== undefined && !validReadScopes.includes(read)) {
      throw new Error(`Invalid read scope: ${read}. Allowed: ${validReadScopes.join(', ')}`);
    }
    if (write !== undefined && !validWriteScopes.includes(write)) {
      throw new Error(`Invalid write scope: ${write}. Allowed: ${validWriteScopes.join(', ')}`);
    }
    const results: Array<{ accountId: string; status: string }> = [];

    const bulkOps: any[] = [];
    const deleteOps: any[] = [];   // renamed from deleteConditions

    for (const accountId of accountIds) {
      const effectiveRead = read ?? 'none';
      const effectiveWrite = write ?? 'none';

      if (effectiveRead === 'none' && effectiveWrite === 'none') {
        deleteOps.push({ deleteOne: { filter: { userId, accountId } } });   // use deleteOne inside bulkWrite
        results.push({ accountId, status: 'deleted' });
      } else {
        const updateDoc = {
          $set: {
            userId,
            accountId,
            level: level ?? 0,
            read: effectiveRead,
            write: effectiveWrite,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        };
        bulkOps.push({
          updateOne: {
            filter: { userId, accountId },
            update: updateDoc,
            upsert: true,
          },
        });
        results.push({ accountId, status: 'success' });
      }
    }

    if (bulkOps.length) await models.Permissions.bulkWrite(bulkOps);
    if (deleteOps.length) await models.Permissions.bulkWrite(deleteOps);   // use bulkWrite for deletes

    return results;
  },
};

export const MutationsAccountPermissions = mutationsAccountPermissions;