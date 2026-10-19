import { sendTRPCMessage } from 'erxes-api-shared/utils';

type TDealContacts = {
  _id: string;
  customerIds?: string[];
  companyIds?: string[];
};

/**
 * A deal's customer or company ids. Deals keep them on themselves once
 * migrated (both fields set, as erxes-api-shared `hasContactFields`); until
 * then, or when only the id is known, core relations answer as before.
 */
export const getDealContactIds = async (
  subdomain: string,
  deal: TDealContacts | string,
  kind: 'customer' | 'company',
): Promise<string[]> => {
  if (
    typeof deal !== 'string' &&
    Array.isArray(deal.customerIds) &&
    Array.isArray(deal.companyIds)
  ) {
    return kind === 'customer' ? deal.customerIds : deal.companyIds;
  }

  return (
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'relation',
      action: 'getRelationIds',
      input: {
        contentType: 'sales:deal',
        contentId: typeof deal === 'string' ? deal : deal._id,
        relatedContentType:
          kind === 'customer' ? 'core:customer' : 'core:company',
      },
      defaultValue: [],
    })) || []
  );
};
