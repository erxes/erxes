import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { JOURNALS, TR_FOLLOW_TYPES, TR_SIDES } from '../@types/constants';
import { ICtaxRow } from '../@types/ctaxRow';
import { ITransaction, ITransactionDocument } from '../@types/transaction';
import { IVatRow } from '../@types/vatRow';
import { createOrUpdateTr } from './utils';


class TaxTrs {
  private models: IModels;
  private doc: ITransaction;
  private side: 'dt' | 'ct';
  private isWithTax: boolean;

  private vatAccountId?: string;
  private ctaxAccountId?: string;
  private taxPercent = 0;
  private vatRow?: IVatRow;
  private ctaxRow?: ICtaxRow;

  private vatTrDoc?: ITransaction;
  private ctaxTrDoc?: ITransaction;
  private sumDt = 0;
  private sumCt = 0;

  constructor(
    models: IModels, doc: ITransaction, side: 'dt' | 'ct', isWithTax?: boolean
  ) {
    this.models = models;
    this.doc = doc;
    this.side = side;
    this.isWithTax = isWithTax ?? false;
  }

  private initTaxValues = async () => {
    let taxPercent = 0;
    const { HasVat: hasVat, HasCtax: hasCtax } = await this.models.AccountingConfigs.getConfigs(['HasVat', 'HasCtax']);
    if (hasVat && this.doc.hasVat) {
      let configKey = '';
      if (this.doc.afterVat) {
        if (this.side === 'dt') {
          configKey = 'VatAfterReceivableAccount'
        } else {
          configKey = 'VatAfterPayableAccount'
        }
      } else {
        if (this.side === 'dt') {
          configKey = 'VatReceivableAccount'
        } else {
          configKey = 'VatPayableAccount'
        }
      }

      const vatAccs = await this.models.AccountingConfigs.getConfigs([configKey]);
      this.vatAccountId = vatAccs[configKey]

      if (!this.vatAccountId) {
        throw new Error(`must init vat account ${configKey}`)
      }

      this.vatRow = await this.models.VatRows.getVatRow({ _id: this.doc.vatRowId });
      taxPercent += this.vatRow.percent || 0;
    }

    if (hasCtax && this.doc.hasCtax) {
      const ctaxAccs = await this.models.AccountingConfigs.getConfigs([
        'CtaxPayableAccount'
      ]);

      this.ctaxAccountId = ctaxAccs.CtaxPayableAccount;

      if (!this.ctaxAccountId) {
        throw new Error('must init ctax account id')
      }

      this.ctaxRow = await this.models.CtaxRows.getCtaxRow({ _id: this.doc.ctaxRowId });
      taxPercent += this.ctaxRow.percent;
    }

    this.taxPercent = taxPercent;

    this.sumDt = this.doc.details
      .filter(d => d.side === TR_SIDES.DEBIT)
      .reduce((sum, cur) => sum + cur.amount, 0)

    this.sumCt = this.doc.details
      .filter(d => d.side === TR_SIDES.CREDIT)
      .reduce((sum, cur) => sum + cur.amount, 0)
  }

  private checkVatValidation = async () => {
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

    const sumValue = this.sumDt + this.sumCt;
    const vatPercent = this.vatRow?.percent || 0;

    const vatValue = this.isWithTax ?
      sumValue / (100 + this.taxPercent) * vatPercent :
      sumValue / 100 * vatPercent

    this.vatTrDoc = {
      ptrId: this.doc.ptrId,
      parentId: this.doc.parentId,
      number: this.doc.number,
      date: this.doc.date,
      description: this.doc.description,
      journal: JOURNALS.TAX,
      branchId: this.doc.branchId,
      departmentId: this.doc.departmentId,
      customerType: this.doc.customerType,
      customerId: this.doc.customerId,
      details: [{
        _id: nanoid(),
        accountId: this.vatAccountId ?? '',
        side: this.side,
        amount: vatValue
      }],
    }

    return this.vatTrDoc
  }

  private checkCtaxValidation = async () => {
    const detail = this.doc.details[0];
    if (!detail) {
      throw new Error('has not detail')
    }

    if (!this.doc.hasCtax) {
      return;
    }

    if (!this.doc.ctaxRowId) {
      throw new Error('must choose ctax row')
    }

    const sumValue = this.sumDt + this.sumCt;
    const ctaxPercent = this.ctaxRow?.percent || 0;

    const ctaxValue = this.isWithTax ?
      sumValue / (100 + this.taxPercent) * ctaxPercent :
      sumValue / 100 * ctaxPercent

    if (this.side === 'ct') {
      this.ctaxTrDoc = {
        ptrId: this.doc.ptrId,
        parentId: this.doc.parentId,
        number: this.doc.number,
        date: this.doc.date,
        description: this.doc.description,
        journal: JOURNALS.TAX,
        branchId: this.doc.branchId,
        departmentId: this.doc.departmentId,
        customerType: this.doc.customerType,
        customerId: this.doc.customerId,
        details: [{
          _id: nanoid(),
          accountId: this.ctaxAccountId ?? '',
          side: this.side,
          amount: ctaxValue
        }],
      }
      return this.ctaxTrDoc
    }
  }

  public checkTaxValidation = async () => {
    await this.initTaxValues();
    await this.checkVatValidation();
    await this.checkCtaxValidation();
  }

  private doVatTr = async (transaction: ITransactionDocument) => {
    let vatTr;

    const oldFollowVatTrs = await this.models.Transactions.find({ originId: transaction._id, originType: TR_FOLLOW_TYPES.VAT }).lean();

    if (!this.vatTrDoc) {
      if (oldFollowVatTrs.length) {
        await this.models.Transactions.deleteMany({ _id: { $in: oldFollowVatTrs.map(tr => tr._id) } });
      }
      return;
    }

    const oldvatTr = oldFollowVatTrs[0];

    if (oldFollowVatTrs.length > 1) {
      await this.models.Transactions.deleteMany({ _id: { $in: oldFollowVatTrs.slice(1).map(tr => tr._id) } });
    }

    vatTr = await createOrUpdateTr(this.models, {
      ...this.vatTrDoc,
      originId: transaction._id,
      originType: TR_FOLLOW_TYPES.VAT,
      parentId: transaction.parentId,
      ptrId: transaction.ptrId
    }, oldvatTr);

    if (transaction.vatAmount !== this.vatTrDoc.details[0].amount) {
      await this.models.Transactions.updateOne({ _id: transaction._id }, {
        $set: { vatAmount: this.vatTrDoc.details[0].amount },
      });
    }

    return vatTr;
  }

  private doCtaxTr = async (transaction: ITransactionDocument) => {
    let ctaxTr;

    const oldFollowCtaxTrs = await this.models.Transactions.find({ originId: transaction._id, originType: TR_FOLLOW_TYPES.CTAX }).lean();

    if (!this.ctaxTrDoc) {
      if (oldFollowCtaxTrs.length) {
        await this.models.Transactions.deleteMany({ _id: { $in: oldFollowCtaxTrs.map(tr => tr._id) } });
      }
      return;
    }

    const oldctaxTr = oldFollowCtaxTrs[0];

    if (oldFollowCtaxTrs.length > 1) {
      await this.models.Transactions.deleteMany({ _id: { $in: oldFollowCtaxTrs.slice(1).map(tr => tr._id) } });
    }

    ctaxTr = await createOrUpdateTr(this.models, {
      ...this.ctaxTrDoc,
      originId: transaction._id,
      originType: TR_FOLLOW_TYPES.CTAX,
      parentId: transaction.parentId,
      ptrId: transaction.ptrId
    }, oldctaxTr);

    if (transaction.ctaxAmount !== this.ctaxTrDoc.details[0].amount) {
      await this.models.Transactions.updateOne({ _id: transaction._id }, {
        $set: { ctaxAmount: this.ctaxTrDoc.details[0].amount },
      });
    }

    return ctaxTr;
  }

  public doTaxTrs = async (transaction) => {
    const vatTr = await this.doVatTr(transaction);
    const ctaxTr = await this.doCtaxTr(transaction);

    const result: ITransactionDocument[] = [];
    if (vatTr) {
      result.push(vatTr)
    }
    if (ctaxTr) {
      result.push(ctaxTr)
    }
    return result
  }
}

export default TaxTrs
