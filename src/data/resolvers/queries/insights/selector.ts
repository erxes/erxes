import { Integrations } from '../../../../db/models';
import { IListArgs } from './types';
import { fixDates, noConversationSelector } from './utils';

export interface IIntegrationSelector {
  kind?: { $in: string[] };
  brandId?: { $in: string[] };
}

export const getIntegrationSelector = (args: IListArgs) => {
  const { integrationIds, brandIds } = args;
  const integrationSelector: any = {};

  if (integrationIds) {
    integrationSelector.kind = { $in: integrationIds.split(',') };
  }

  if (brandIds) {
    integrationSelector.brandId = { $in: brandIds.split(',') };
  }

  return integrationSelector;
};

export const getConversationSelector = async (integrationSelector: IIntegrationSelector) => {
  const conversationSelector: any = {};

  if (Object.keys(integrationSelector).length > 0) {
    const integrationIds = await Integrations.find(integrationSelector).select('_id');
    conversationSelector.integrationId = { $in: integrationIds.map(row => row._id) };
  }

  return { ...conversationSelector, ...noConversationSelector };
};

export const getDateSelector = (args: IListArgs) => {
  const { startDate, endDate } = args;
  const { start, end } = fixDates(startDate, endDate);

  return { $gte: start, $lte: end };
};
