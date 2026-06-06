import { DEAL_ACTIVITY_FIELDS } from './constants';

export const getDealFieldLabel = (field: string) => {
  const match = DEAL_ACTIVITY_FIELDS.find((item) => item.field === field);
  return match?.label || field;
};

export const buildDealTarget = (deal: any) => ({
  _id: deal._id,
  moduleName: 'sales',
  collectionName: 'deals',
  text: deal.name,
});
