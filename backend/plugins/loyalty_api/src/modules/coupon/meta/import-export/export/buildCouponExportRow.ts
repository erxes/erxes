type Maps = {
  campaignMap: Map<string, string>;
};

const formatValue = (v: any): string => {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
};

export const buildCouponExportRow = (
  coupon: any,
  selectedFields?: string[],
  maps?: Partial<Maps>,
): Record<string, any> => {
  const campaignTitle = coupon.campaignId
    ? maps?.campaignMap?.get(String(coupon.campaignId)) || coupon.campaignId
    : '';

  const allFields: Record<string, any> = {
    _id: formatValue(coupon._id),
    code: formatValue(coupon.code),
    campaignId: formatValue(campaignTitle),
    status: formatValue(coupon.status),
    ownerType: formatValue(coupon.ownerType),
    ownerId: formatValue(coupon.ownerId),
    usageCount: formatValue(coupon.usageCount),
    usageLimit: formatValue(coupon.usageLimit),
    redemptionLimitPerUser: formatValue(coupon.redemptionLimitPerUser),
    createdAt: formatValue(coupon.createdAt ? new Date(coupon.createdAt) : ''),
    updatedAt: formatValue(coupon.updatedAt ? new Date(coupon.updatedAt) : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(coupon._id || '') };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
