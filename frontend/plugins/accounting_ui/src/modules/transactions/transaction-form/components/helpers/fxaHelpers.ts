import { TFxaDetail } from '../../types/JournalForms';
import { getTempId } from '../utils';

export type TFxaCodeInstance = {
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

export const getFxaInstanceDisplayCode = (
  instance: TFxaCodeInstance,
  fixedAssetCode?: string,
) => {
  if (instance.code) {
    return instance.code;
  }

  if (!fixedAssetCode || !instance.sequence) {
    return '-';
  }

  return `${fixedAssetCode}_${String(instance.sequence).padStart(3, '0')}`;
};
