import BigNumber from 'bignumber.js';
import { IModels } from '../../connectionResolver';
import {
  BLOCK_STATUS,
  BLOCK_TYPE,
  TRANSACTION_TYPE
} from '../definitions/constants';
import { ITransactionDocument } from '../definitions/transactions';
import { getFullDate } from './utils';
import { IBlockDocument } from '../definitions/blocks';

export const checkBlock = async (models: IModels, tr: ITransactionDocument) => {
  if (!tr.contractId || tr.transactionType !== TRANSACTION_TYPE.INCOME) return;

  const nowDate = getFullDate(new Date());

  const blocks = await models.Block.find({
    contractId: tr.contractId,
    status: BLOCK_STATUS.PENDING,
    $or: [
      {
        blockType: BLOCK_TYPE.LOAN_PAYMENT
      },
      {
        blockType: BLOCK_TYPE.SCHEDULE_TRANSACTION,
        scheduleDate: {
          $exists: true,
          $lte: nowDate
        }
      }
    ]
  });

  if (blocks.length > 0 && tr.total > 0) {
    let totalAmount = tr.total;
    for await (let block of blocks) {
      await doBlockTransaction({ block, totalAmount, models, tr });
    }
  }
};

export async function doBlockTransaction({
  block,
  totalAmount,
  models,
  tr
}: {
  block: IBlockDocument;
  totalAmount: number;
  models: IModels;
  tr: ITransactionDocument;
}) {
  let mustPay = new BigNumber(block.amount)
    .minus(block.didAmount)
    .dp(2)
    .toNumber();
  let transactionAmount = 0;

  if (mustPay > totalAmount) {
    transactionAmount = totalAmount;
  } else {
    transactionAmount = mustPay;
  }

  if (mustPay > 0) {
    await models.Transactions.createTransaction({
      contractId: tr.contractId,
      customerId: tr.customerId,
      companyId: tr.companyId,
      transactionType: TRANSACTION_TYPE.OUTCOME,
      description: 'AUTO payment',
      payDate: new Date(),
      currency: tr.currency,
      total: transactionAmount
    });
  }
}
