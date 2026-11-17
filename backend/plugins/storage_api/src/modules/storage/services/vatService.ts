import { IEBarimtReceipt, IModels } from '../db/models/Storage';
import { LIMITS, newGroupId, StorageInputError, VAT_TOLERANCE } from './validation';

type ReceiptSnapshot = IEBarimtReceipt & { _id: unknown };

const release = (models: IModels, groupId: string) =>
  Promise.all([
    models.EBarimtReceipts.updateMany({ matchedGroupId: groupId }, { $set: { status: 'UNMATCHED', matchedGroupId: null } }),
    models.VatPayables.updateMany({ matchedGroupId: groupId }, { $set: { status: 'UNMATCHED', matchedGroupId: null } }),
  ]);

/**
 * Matches one receipt to one payable with the same TIN, VAT amount and invoice
 * amount (within tolerance). Both records are claimed with conditional updates,
 * so two concurrent runs can never match the same record twice; if the second
 * claim fails, the first is released.
 */
const matchReceipt = async (models: IModels, receipt: ReceiptSnapshot): Promise<boolean> => {
  const groupId = newGroupId('VAT-AUTO');

  const claimed = await models.EBarimtReceipts.updateOne(
    { _id: receipt._id, status: 'UNMATCHED' },
    { $set: { status: 'MATCHED', matchedGroupId: groupId } },
  );
  if (claimed.modifiedCount === 0) return false;

  try {
    const payable = await models.VatPayables.findOneAndUpdate(
      {
        status: 'UNMATCHED',
        vendorTin: receipt.vendorTin,
        vatAmount: { $gte: receipt.vatAmount - VAT_TOLERANCE.AUTO_VAT, $lte: receipt.vatAmount + VAT_TOLERANCE.AUTO_VAT },
        amount: { $gte: receipt.amount - VAT_TOLERANCE.AUTO_AMOUNT, $lte: receipt.amount + VAT_TOLERANCE.AUTO_AMOUNT },
      },
      { $set: { status: 'MATCHED', matchedGroupId: groupId } },
      { sort: { createdAt: 1 } },
    );

    if (!payable) {
      await release(models, groupId);
      return false;
    }
    return true;
  } catch (e) {
    await release(models, groupId);
    throw e;
  }
};

const matchInChunks = async (models: IModels, receipts: ReceiptSnapshot[], offset = 0, matched = 0): Promise<number> => {
  if (offset >= receipts.length) return matched;
  const chunk = receipts.slice(offset, offset + LIMITS.VAT_AUTO_CONCURRENCY);
  const results = await Promise.all(chunk.map((r) => matchReceipt(models, r)));
  return matchInChunks(models, receipts, offset + chunk.length, matched + results.filter(Boolean).length);
};

/**
 * Processes up to VAT_AUTO_BATCH unmatched receipts per call using indexed
 * lookups (no full-collection scan). Returns how many receipts were matched;
 * call again to continue with the next batch.
 */
export const autoReconcileVat = async (models: IModels) => {
  const tins = await models.VatPayables.distinct('vendorTin', { status: 'UNMATCHED' });
  if (tins.length === 0) return 0;

  const receipts = await models.EBarimtReceipts.find({ status: 'UNMATCHED', vendorTin: { $in: tins } })
    .sort({ createdAt: 1 })
    .limit(LIMITS.VAT_AUTO_BATCH)
    .lean();

  return matchInChunks(models, receipts as ReceiptSnapshot[]);
};

export const manualReconcileVat = async (models: IModels, payableIdsInput: string[], receiptId: string) => {
  const payableIds = [...new Set(payableIdsInput)];

  if (payableIds.length === 0 || payableIds.length > LIMITS.MAX_MANUAL_VAT_PAYABLES) {
    throw new StorageInputError(`1-${LIMITS.MAX_MANUAL_VAT_PAYABLES} өглөг сонгоно уу.`);
  }

  const [receipt, payables] = await Promise.all([
    models.EBarimtReceipts.findById(receiptId).lean(),
    models.VatPayables.find({ _id: { $in: payableIds } }).lean(),
  ]);

  if (!receipt) throw new StorageInputError('e-Barimt баримт олдсонгүй.');
  if (receipt.status !== 'UNMATCHED') throw new StorageInputError('e-Barimt баримт аль хэдийн тулгагдсан байна.');
  if (payables.length !== payableIds.length) throw new StorageInputError('Сонгосон өглөгийн зарим нь олдсонгүй.');
  if (payables.some((p) => p.status !== 'UNMATCHED')) {
    throw new StorageInputError('Сонгосон өглөгийн зарим нь аль хэдийн тулгагдсан байна.');
  }
  if (payables.some((p) => p.vendorTin !== receipt.vendorTin)) {
    throw new StorageInputError(`Бүх өглөг e-Barimt-ын ТТД (${receipt.vendorTin})-тэй ижил байх ёстой.`);
  }

  const sumVat = payables.reduce((s, p) => s + p.vatAmount, 0);
  if (Math.abs(sumVat - receipt.vatAmount) > VAT_TOLERANCE.MANUAL_VAT) {
    throw new StorageInputError(`НӨАТ-ын дүн зөрүүтэй байна: Өглөг=${sumVat}, e-Barimt=${receipt.vatAmount}`);
  }

  const groupId = newGroupId('VAT-MAN');

  const claimed = await models.EBarimtReceipts.updateOne(
    { _id: receipt._id, status: 'UNMATCHED' },
    { $set: { status: 'MATCHED', matchedGroupId: groupId } },
  );
  if (claimed.modifiedCount === 0) throw new StorageInputError('e-Barimt баримт аль хэдийн тулгагдсан байна.');

  try {
    const res = await models.VatPayables.updateMany(
      { _id: { $in: payableIds }, status: 'UNMATCHED' },
      { $set: { status: 'MATCHED', matchedGroupId: groupId } },
    );
    if (res.modifiedCount !== payableIds.length) {
      throw new StorageInputError('Сонгосон өглөгийн зарим нь зэрэг тулгагдсан байна. Дахин оролдоно уу.');
    }
  } catch (e) {
    await release(models, groupId);
    throw e;
  }

  return groupId;
};
