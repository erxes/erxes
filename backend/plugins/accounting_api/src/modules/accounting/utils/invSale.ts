import { fixNum } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { IAccountDocument } from '../@types/account';
import { JOURNALS, TR_DETAIL_FOLLOW_TYPES, TR_FOLLOW_TYPES, TR_SIDES } from '../@types/constants';
import { ITransaction, ITransactionDocument, ITrDetail } from '../@types/transaction';
import { activeCost } from './inventories';
import { createOrUpdateTr } from './utils';

class InvSaleOutCostTrs {
  private models: IModels;
  private trDoc: ITransaction;
  private outAccount: IAccountDocument;
  private costAccount: IAccountDocument;

  constructor(
    models: IModels,
    trDoc: ITransaction
  ) {
    this.models = models;
    this.trDoc = trDoc;
  }

  public checkValidation = async () => {
    const { saleOutAccountId, saleCostAccountId } = this.trDoc.followInfos;
    if (!saleOutAccountId || !saleCostAccountId) {
      throw new Error('Must fill sale Out Account and Cost Account')
    }

    const accounts = await this.models.Accounts.find({ _id: { $in: [saleOutAccountId, saleCostAccountId] } });
    const outAccount = accounts.find(a => a._id === saleOutAccountId)
    const costAccount = accounts.find(a => a._id === saleCostAccountId)

    if (!outAccount?._id || !costAccount?._id) {
      throw new Error('Not found sale Out Account or Cost Account')
    }

    this.outAccount = outAccount;
    this.costAccount = costAccount;
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

    const oldFollowOutTrs = await this.models.Transactions.find({
      originId: transaction._id, followType: TR_FOLLOW_TYPES.INV_SALE_OUT
    }).sort({ createdAt: -1 }).lean();

    const oldFollowCostTrs = await this.models.Transactions.find({
      originId: transaction._id, followType: TR_FOLLOW_TYPES.INV_SALE_COST
    }).sort({ createdAt: -1 }).lean();

    const oldFollowOutTr = await this.cleanFollowTrs(oldFollowOutTrs);
    const oldFollowCostTr = await this.cleanFollowTrs(oldFollowCostTrs);

    const ptrId = oldFollowOutTr?.ptrId || oldFollowCostTr?.ptrId || nanoid();

    const commonFollowTrDoc = {
      ptrId,
      parentId: transaction.parentId,
      originId: transaction._id,
      number: transaction.number,
      date: transaction.date,
      description: transaction.description,
      branchId: transaction.branchId,
      departmentId: transaction.departmentId,
      customerType: transaction.customerType,
      customerId: transaction.customerId,
      details: []
    }

    const followOutDetails: ITrDetail[] = [];
    const followCostDetails: ITrDetail[] = [];

    const costs = await activeCost(this.models, this.outAccount._id, transaction.branchId, transaction.departmentId, details.map(d => d.productId));

    for (const detail of details) {
      const oldOutDetail = oldFollowOutTr?.details.find(oldDet => oldDet.originId === detail._id);
      const oldCostDetail = oldFollowCostTr?.details.find(oldDet => oldDet.originId === detail._id);

      const cost = costs[detail.productId] || {};
      const unitPrice = cost?.totalCost / (cost?.remainder ?? 1)
      const amount = fixNum(unitPrice * detail.count, 4);

      const commonDetail = {
        originId: detail._id,
        productId: detail.productId,
        count: detail.count,
        amount,
        unitPrice: amount / (detail.count ?? 1)
      }

      followOutDetails.push({
        ...oldOutDetail,
        ...commonDetail,
        followType: TR_DETAIL_FOLLOW_TYPES.SALE_OUT,
        accountId: this.outAccount._id,
        side: TR_SIDES.CREDIT
      })

      followCostDetails.push({
        ...oldCostDetail,
        ...commonDetail,
        followType: TR_DETAIL_FOLLOW_TYPES.SALE_COST,
        accountId: this.costAccount._id,
        side: TR_SIDES.DEBIT
      })
    }

    const outTrDoc: ITransaction = {
      ...commonFollowTrDoc,
      followType: TR_FOLLOW_TYPES.INV_SALE_OUT,
      journal: JOURNALS.INV_SALE_OUT,
      details: followOutDetails
    }

    const costTrDoc: ITransaction = {
      ...commonFollowTrDoc,
      followType: TR_FOLLOW_TYPES.INV_SALE_COST,
      journal: JOURNALS.INV_SALE_COST,
      details: followCostDetails
    }

    const outTr = await createOrUpdateTr(this.models, outTrDoc, oldFollowOutTr);
    const costTr = await createOrUpdateTr(this.models, costTrDoc, oldFollowCostTr);

    return [outTr, costTr]
  }
}

export default InvSaleOutCostTrs;
