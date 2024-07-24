import { nanoid } from 'nanoid';
import { IModels } from "../connectionResolver";
import { JOURNALS, TR_SIDES } from "../models/definitions/constants";
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import { IVatRow } from '../models/definitions/vatRow';
import { ICtaxRow } from '../models/definitions/ctaxRow';


export default class calcTax {
  private models: IModels;
  private doc: ITransactionDocument;
  private mainAmount: number;
  private side: 'dt' | 'ct';

  private vatPayAccountId?: string;
  private vatRecAccountId?: string;
  private ctaxPayAccountId?: string;
  private taxPercent: number = 0;
  private vatRow?: IVatRow;
  private ctaxRow?: ICtaxRow;

  private vatTrDoc?: ITransaction;

  constructor(
    models: IModels, doc: ITransactionDocument, side: 'dt' | 'ct', mainAmount: number
  ) {
    this.models = models;
    this.doc = doc;
    this.mainAmount = mainAmount;
    this.side = side;
  }

  public getTaxValues = async () => {
    let taxPercent = 0;
    const { Hasvat: hasVat, HasCtax: hasCtax } = await this.models.AccountingConfigs.getConfigs(['HasVat', 'HasCtax']);

    if (hasVat && this.doc.hasVat) {
      if (this.doc.afterVat) {
        const afterAccs = await this.models.AccountingConfigs.getConfigs([
          'VatAfterPayableAccount', 'VatAfterReceivableAccount'
        ]);

        this.vatPayAccountId = afterAccs.VatAfterPayableAccount;
        this.vatRecAccountId = afterAccs.VatAfterReceivableAccount
      } else {
        const accs = await this.models.AccountingConfigs.getConfigs([
          'VatPayableAccount', 'VatReceivableAccount'
        ]);
        this.vatPayAccountId = accs.VatAfterPayableAccount;
        this.vatRecAccountId = accs.VatAfterReceivableAccount
      }
      taxPercent += this.vatRow?.percent || 0;
    }
    if (hasCtax && this.doc.hasCtax) {
      const accs = await this.models.AccountingConfigs.getConfigs([
        'CtaxPayableAccount'
      ]);

      this.ctaxPayAccountId = accs.CtaxPayableAccount;

      this.ctaxRow = await this.models.CtaxRows.getCtaxRow({ _id: this.doc.ctaxRowId });
      taxPercent += this.ctaxRow.percent;
    }

    this.taxPercent = taxPercent;
  }

  public checkVatValidation = async () => {
    const detail = this.doc.details[0];
    if (!detail) {
      throw new Error('has not detail')
    }

    if (!this.doc.hasVat) {
      return;
    }

    if (!this.doc.vatRowId && !this.doc.afterVat) {
      throw new Error('must choose vat row')
    }

    const sumValue = this.doc.sumDt + this.doc.sumCt;
    this.vatRow = await this.models.VatRows.getVatRow({ _id: this.doc.vatRowId });
    const vatValue = sumValue / this.taxPercent * (this.vatRow.percent || 0)

    this.vatTrDoc = {
      ptrId: this.doc.ptrId,
      parentId: this.doc.parentId,
      number: this.doc.number,
      date: this.doc.date,
      description: this.doc.description,
      journal: JOURNALS.VAT,
      branchId: this.doc.branchId,
      departmentId: this.doc.departmentId,
      customerType: this.doc.customerType,
      customerId: this.doc.customerId,
      details: [{
        _id: nanoid(),
        accountId: detail.followInfos.currencyDiffAccountId,
        side: this.side,
        amount: vatValue
      }],
    }

    return this.vatTrDoc
  }

  private doVatTr = async (transaction) => {
    let vatTr;
    const oldFollowInfo = (transaction.follows || []).find(f => f.type === 'currencyDiff');

    const amount = (transaction.details[0].currencyAmount || 0) * (this.spotRate?.rate || 0) || transaction.details[0].amount || 0;

    if (!this.vatTrDoc) {
      if (oldFollowInfo) {
        await this.models.Transactions.updateOne({ _id: transaction._id }, {
          $set: { 'details.0.amount': amount },
          $pull: {
            follows: { ...oldFollowInfo }
          }
        });
        await this.models.Transactions.deleteOne({ _id: oldFollowInfo.id })
      }
      return;
    }

    if (oldFollowInfo) {
      const oldvatTr = await this.models.Transactions.findOne({ _id: oldFollowInfo.id });
      if (oldvatTr) {
        await this.models.Transactions.updateTransaction(oldvatTr._id, { ...this.vatTrDoc, originId: transaction._id });
        vatTr = this.models.Transactions.findOne({ _id: oldvatTr._id });

      } else {
        vatTr = await this.models.Transactions.createTransaction({ ...this.vatTrDoc, originId: transaction._id });
        await this.models.Transactions.updateOne({ _id: transaction._id }, {
          $pull: {
            follows: { ...oldFollowInfo }
          }
        })
        await this.models.Transactions.updateOne({ _id: transaction._id }, {
          $set: { 'details.0.amount': amount },
          $addToSet: {
            follows: {
              type: 'currencyDiff',
              id: vatTr._id
            }
          }
        });
      }

    } else {
      vatTr = await this.models.Transactions.createTransaction({ ...this.vatTrDoc, originId: transaction._id });
      await this.models.Transactions.updateOne({ _id: transaction._id }, {
        $set: { 'details.0.amount': amount },
        $addToSet: {
          follows: [{
            type: 'currencyDiff',
            id: vatTr._id
          }]
        }
      });
    }

    return vatTr;
  }
  private doCtaxTr = () => { }
  public doTaxTrs = () => { }


}