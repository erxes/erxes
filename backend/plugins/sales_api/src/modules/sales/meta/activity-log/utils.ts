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
  // Carried so an entry can say what produced the deal, and so an automation
  // run — which has no signed-in user — still has someone to record as actor.
  createdVia: deal.createdVia,
});
