import { IContext } from "~/connectionResolvers";
import { ITransaction } from "@/accounting/@types/transaction";

const transactionsMutations = {
  async accTransactionsLink(_root, doc: { ids: string[], ptrId: string }, { user, models }) {
    const { ids, ptrId } = doc;
    return await models.Transactions.linkTransaction(ids, ptrId)
  },
  /**
   * Creates a new perfect transaction form
   */
  async accTransactionsCreate(
    _root,
    { trDocs }: { trDocs: ITransaction[] },
    { user, models }: IContext,
  ) {

    const transactions = await models.Transactions.createPTransaction(trDocs, user);

    return transactions;
  },

  /**
   * Edits a perfect transaction form
   */
  async accTransactionsUpdate(
    _root,
    { parentId, trDocs }: { parentId: string, trDocs: (ITransaction & { _id?: string })[] },
    { user, models }: IContext,
  ) {
    const transactions = await models.Transactions.updatePTransaction(parentId, trDocs, user);

    return transactions;
  },

  /**
   * Removes a transactions of parent
   */
  async accTransactionsRemove(
    _root,
    { parentId, ptrId }: { parentId: string, ptrId: string },
    { models }: IContext,
  ) {
    const removed = await models.Transactions.removePTransaction(parentId, ptrId);

    return removed;
  },
};

export default transactionsMutations;
