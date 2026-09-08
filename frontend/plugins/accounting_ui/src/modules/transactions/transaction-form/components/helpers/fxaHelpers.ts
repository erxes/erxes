import { TFxaDetail } from '../../types/JournalForms';
import { getTempId } from '../utils';

export type TFxaCodeOwnerRecord = {
  code?: string;
  sequence?: number;
};

export const getFxaDetailDefaultValues = (
  detail?: Partial<TFxaDetail>,
): TFxaDetail => ({
  ...detail,
  _id: getTempId(),
  accountId: detail?.accountId || '',
  fixedAssetId: detail?.fixedAssetId || '',
  fixedAssetCategoryId: detail?.fixedAssetCategoryId || '',
  fixedAssetCode: detail?.fixedAssetCode || '',
  fixedAssetName: detail?.fixedAssetName || '',
  count: detail?.count ?? 0,
  unitPrice: detail?.unitPrice ?? 0,
  amount: detail?.amount ?? 0,
  checked: false,
});

export const getFxaCodeSequence = (code: string, assetCode: string) => {
  const escapedAssetCode = assetCode.replace(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`,
  );
  const match = new RegExp(String.raw`^${escapedAssetCode}_(\d+)$`).exec(code);

  return match ? Number(match[1]) : 0;
};

export const getFxaOwnerRecordDisplayCode = (
  ownerRecord: TFxaCodeOwnerRecord,
  fixedAssetCode?: string,
) => {
  if (ownerRecord.code) {
    return ownerRecord.code;
  }

  if (!fixedAssetCode || !ownerRecord.sequence) {
    return '-';
  }

  return `${fixedAssetCode}_${String(ownerRecord.sequence).padStart(3, '0')}`;
};
