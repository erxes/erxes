import { IContext } from '~/connectionResolvers';
import { ITransaction } from '@/accounting/@types/transaction';
import { assertTransactionJournalsPermission } from '../../../utils/transactionPermissions';

const getRootTransactionJournals = (transactions: ITransaction[]) =>
  transactions
    .filter((transaction) => !transaction.originId)
    .map((transaction) => transaction.journal);

const transactionsMutations = {
  async accTransactionsLink(
    _root,
    doc: { ids: string[]; ptrId: string },
    { models, checkPermission }: IContext,
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
    { user, models, checkPermission }: IContext,
  ) {
    await assertTransactionJournalsPermission(
      { checkPermission, user },
      getRootTransactionJournals(trDocs),
      'manage',
    );

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
    { user, models, checkPermission }: IContext,
  ) {
    const oldTransactions = await models.Transactions.find({ parentId }).lean();

    await assertTransactionJournalsPermission(
      { checkPermission, user },
      [
        ...getRootTransactionJournals(trDocs),
        ...oldTransactions
          .filter((transaction) => !transaction.originId)
          .map((transaction) => transaction.journal),
      ],
      'manage',
    );

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
    { models, user, checkPermission }: IContext,
  ) {
    const filters: Record<string, string>[] = [];

    if (parentId) {
      filters.push({ parentId });
    }

    if (ptrId) {
      filters.push({ ptrId });
    }

    if (filters.length) {
      const transactions = await models.Transactions.find({
        $or: filters,
      }).lean();

      await assertTransactionJournalsPermission(
        { checkPermission, user },
        transactions
          .filter((transaction) => !transaction.originId)
          .map((transaction) => transaction.journal),
        'remove',
      );
    }

    const removed = await models.Transactions.removePTransaction({
      parentId,
      ptrId,
    });

    return removed;
  },
};

export default transactionsMutations;
