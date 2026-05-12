import { IContext } from '~/connectionResolvers';
import { ITransaction } from '@/accounting/@types/transaction';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';

/**
 * Centralises the permission check for write operations on a transaction.
 * `existingDoc` is the full existing transaction (for update / delete).
 * For create, pass `{}` as `existingDoc` – the check will still
 * extract the accountId from `doc.details[0].accountId`.
 */
async function ensureTransactionWritePermission(
  user: any,
  models: any,
  subdomain: string,
  doc: any,                 // the input doc (or existing transaction)
  existingDoc?: any,        // the full existing document (for update/delete)
) {
  let accountId: string | undefined;
  let targetRecord: { createdBy?: string; modifiedBy?: string } = {};

  if (existingDoc) {
    // update / delete
    accountId =
      (existingDoc as any).accountId || existingDoc.details?.[0]?.accountId;
    targetRecord = {
      createdBy: existingDoc.createdBy,
      modifiedBy: existingDoc.modifiedBy,
    };
  } else {
    // create
    accountId = doc?.details?.[0]?.accountId;
  }

  if (!accountId) throw new Error('Account ID required');

  const getUserLevel = makeGetUserLevel(subdomain);
  const { canWrite } = await checkAccountingPermission(
    user._id,
    accountId,
    targetRecord,
    { Permissions: models.Permissions, Configs: models.Configs as any },
    getUserLevel,
  );
  if (!canWrite) {
    throw new Error(
      existingDoc ? 'Write denied' : 'No permission to create transaction',
    );
  }
}

const transactionsMutations = {
  async accTransactionsLink(
    _root,
    doc: { ids: string[]; ptrId: string },
    { user, models, subdomain }: IContext,
  ) {
    const { ids, ptrId } = doc;
    
    const transactions = await models.Transactions.find({
      _id: { $in: ids },
    }).lean();
    for (const tr of transactions) {
      const accountId = tr.details?.[0]?.accountId;
      if (accountId) {
        // Ensure the user has write permission on the transaction's account
        await ensureTransactionWritePermission(user, models, subdomain, {}, tr);
      }
    }

    return await models.Transactions.linkTransaction(ids, ptrId);
  },

  async accTransactionsCreate(
    _root,
    { trDocs }: { trDocs: ITransaction[] },
    { user, models, subdomain }: IContext,
  ) {
    await ensureTransactionWritePermission(user, models, subdomain, trDocs[0]);

    const transactions = await models.Transactions.createPTransaction(
      trDocs,
      user._id,
    );
    return transactions;
  },

  async accTransactionsUpdate(
    _root,
    {
      parentId,
      trDocs,
    }: { parentId: string; trDocs: (ITransaction & { _id?: string })[] },
    { user, models, subdomain }: IContext,
  ) {
    const existing = await models.Transactions.findById(parentId).lean();
    if (!existing) throw new Error('Transaction not found');

    await ensureTransactionWritePermission(
      user,
      models,
      subdomain,
      trDocs[0],
      existing,
    );

    const transactions = await models.Transactions.updatePTransaction(
      parentId,
      trDocs,
      user._id,
    );
    return transactions;
  },

  async accTransactionsRemove(
    _root,
    { parentId, ptrId }: { parentId: string; ptrId: string },
    { user, models, subdomain }: IContext,
  ) {
    const existing = await models.Transactions.findById(parentId).lean();
    if (!existing) throw new Error('Transaction not found');

    await ensureTransactionWritePermission(
      user,
      models,
      subdomain,
      {},
      existing,
    );

    const removed = await models.Transactions.removePTransaction({
      parentId,
      ptrId,
    });
    return removed;
  },
};

export default transactionsMutations;