import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getCouponExportHeaders(
  _data: any,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [
    { label: 'Code', key: 'code', isDefault: true },
    { label: 'Campaign', key: 'campaignId', isDefault: true },
    { label: 'Status', key: 'status', isDefault: true },
    { label: 'Owner Type', key: 'ownerType' },
    { label: 'Owner ID', key: 'ownerId' },
    { label: 'Usage Count', key: 'usageCount' },
    { label: 'Usage Limit', key: 'usageLimit' },
    { label: 'Redemption Limit Per User', key: 'redemptionLimitPerUser' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Updated At', key: 'updatedAt' },
  ];
}
