import { IModels } from '~/connectionResolvers';
import { IAccountDocument } from '../@types/account';
import { JOURNALS, TR_DETAIL_FOLLOW_TYPES, TR_FOLLOW_TYPES, TR_SIDES } from '../@types/constants';
import { ITransaction, ITransactionDocument, ITrDetail } from '../@types/transaction';
import { createOrUpdateTr } from './utils';

class InvMoveInTrs {
  private models: IModels;
  private trDoc: ITransaction;
  private moveInAccount: IAccountDocument;

  constructor(
    models: IModels,
    trDoc: ITransaction
  ) {
    this.models = models;
    this.trDoc = trDoc;
  }

  public checkValidation = async () => {
    const { moveInAccountId, moveInBranchId, moveInDepartmentId } = this.trDoc.followInfos;

    if (!moveInBranchId || !moveInDepartmentId) {
      throw new Error('Must fill move in branch and department')
    }

    if (!moveInAccountId) {
      throw new Error('Must fill move in Account')
    }

    const moveInAccount = await this.models.Accounts.findOne({ _id: moveInAccountId }).lean();

    if (!moveInAccount?._id) {
      throw new Error('Not found move in Account')
    }

    this.moveInAccount = moveInAccount;
  }

  private cleanFollowTrs = async (oldTrs: ITransactionDocument[]) => {
    if (!oldTrs.length) {
      return;
    }

    if (oldTrs.length === 1) {
      return oldTrs[0];
    }

    const oldTr = oldTrs.shift();
    await this.models.Transactions.deleteMany({ _id: { $in: oldTrs.map(otr => otr._id) } });
    return oldTr;
  }

  public doTrs = async (transaction) => {
    const { details } = transaction;

    const oldFollowInTrs = await this.models.Transactions.find({
      originId: transaction._id, followType: TR_FOLLOW_TYPES.INV_MOVE_IN
    }).sort({ createdAt: -1 }).lean();

    const oldFollowInTr = await this.cleanFollowTrs(oldFollowInTrs);

    const commonFollowTrDoc = {
      ptrId: transaction.ptrId,
      parentId: transaction.parentId,
      originId: transaction._id,
      number: transaction.number,
      date: transaction.date,
      description: transaction.description,
      branchId: this.trDoc.followInfos.branchId,
      departmentId: this.trDoc.followInfos.departmentId,
      customerType: transaction.customerType,
      customerId: transaction.customerId,
      details: []
    }

    const followInDetails: ITrDetail[] = [];

    for (const detail of details) {
      const oldInDetail = oldFollowInTr?.details.find(oldDet => oldDet.originId === detail._id);

      followInDetails.push({
        ...oldInDetail,

        originId: detail._id,
        productId: detail.productId,
        count: detail.count,
        amount: detail.amount,
        unitPrice: detail.unitPrice,

        followType: TR_DETAIL_FOLLOW_TYPES.MOVE_IN,
        accountId: this.moveInAccount._id,
        side: TR_SIDES.DEBIT
      })
    }

    const inTrDoc: ITransaction = {
      ...commonFollowTrDoc,
      followType: TR_FOLLOW_TYPES.INV_MOVE_IN,
      journal: JOURNALS.INV_MOVE_IN,
      details: followInDetails
    }

    const inTr = await createOrUpdateTr(this.models, inTrDoc, oldFollowInTr);

    return [inTr]
  }
}

export default InvMoveInTrs;
