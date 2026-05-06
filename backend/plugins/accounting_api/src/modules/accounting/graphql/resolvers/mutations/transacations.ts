import { IContext } from '~/connectionResolvers';
import { ITransaction } from '@/accounting/@types/transaction';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';

const transactionsMutations = {
  async accTransactionsLink(
    _root,
    doc: { ids: string[]; ptrId: string },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('linkTransactions'); 
    const { ids, ptrId } = doc;
    return await models.Transactions.linkTransaction(ids, ptrId);
  },
  /**
   * Creates a new perfect transaction form
   */
  async accTransactionsCreate(
    _root,
    { trDocs }: { trDocs: ITransaction[] },
    { user, models, subdomain }: IContext,
  ) {
    // Extract accountId from first transaction (assuming all belong to same account)
    const accountId = trDocs[0]?.details?.[0]?.accountId;
    if (!accountId) throw new Error('Account ID required');

    // Check permission to create
    const perm = await models.Permissions.findOne({
      userId: user._id,
      accountId,
    });
    const canCreate =
      perm && ['add', 'own', 'ltLvl', 'lteLvl', 'gtLvl'].includes(perm.write);
    if (!canCreate) throw new Error('No permission to create transaction');

    // Proceed with creation (the model method will set createdBy/modifiedBy = user._id)
    const transactions = await models.Transactions.createPTransaction(
      trDocs,
      user._id,
    );
    return transactions;
  },

  /**
   * Edits a perfect transaction form
   */
  async accTransactionsUpdate(
    _root,
    {
      parentId,
      trDocs,
    }: { parentId: string; trDocs: (ITransaction & { _id?: string })[] },
    { user, models, subdomain }: IContext,
  ) {
    // Fetch existing transaction to get accountId and audit fields
    const existing = await models.Transactions.findById(parentId).lean();
    if (!existing) throw new Error('Transaction not found');

    // Extract accountId (adjust based on your schema – top‑level or from details)
    const accountId =
      (existing as any).accountId || existing.details?.[0]?.accountId;
    if (!accountId) throw new Error('Transaction has no associated account');

    const getUserLevel = makeGetUserLevel(subdomain);

    const { canWrite } = await checkAccountingPermission(
      user._id,
      accountId,
      {
        createdBy: existing.createdBy,
        modifiedBy: existing.modifiedBy,
      },
      { Permissions: models.Permissions, Configs: models.Configs as any }, 
      getUserLevel,
    );
    if (!canWrite) throw new Error('Write denied');

    // Proceed with update (model method will set modifiedBy = user._id)
    const transactions = await models.Transactions.updatePTransaction(
      parentId,
      trDocs,
      user._id,
    );
    return transactions;
  },

  /**
   * Removes a transactions of parent
   */
  async accTransactionsRemove(
    _root,
    { parentId, ptrId }: { parentId: string; ptrId: string },
    { user, models, subdomain }: IContext, // add user and subdomain
  ) {
    const existing = await models.Transactions.findById(parentId).lean();
    if (!existing) throw new Error('Transaction not found');

    const accountId =
      (existing as any).accountId || existing.details?.[0]?.accountId;
    if (!accountId) throw new Error('Transaction has no associated account');

    const getUserLevel = makeGetUserLevel(subdomain);

    const { canWrite } = await checkAccountingPermission(
      user._id,
      accountId,
      {
        createdBy: existing.createdBy,
        modifiedBy: existing.modifiedBy,
      },
      { Permissions: models.Permissions, Configs: models.Configs as any }, 
      getUserLevel,
    );
    if (!canWrite) throw new Error('Delete denied');

    const removed = await models.Transactions.removePTransaction({
      parentId,
      ptrId,
    });
    return removed;
  },
};

export default transactionsMutations;
