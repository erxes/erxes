import { sendTRPCMessage } from 'erxes-api-shared/utils';

type TDealContacts = {
  _id: string;
  customerId?: string | null;
  companyId?: string | null;
};

/**
 * A deal's customer or company id, as a list of at most one. Deals keep it
 * on themselves once migrated (both fields set, as erxes-api-shared
 * `hasContactFields`); until then, or when only the id is known, core
 * relations answer as before.
 */
export const getDealContactIds = async (
  subdomain: string,
  deal: TDealContacts | string,
  kind: 'customer' | 'company',
): Promise<string[]> => {
  if (
    typeof deal !== 'string' &&
    deal.customerId !== undefined &&
    deal.companyId !== undefined
  ) {
    const contactId = kind === 'customer' ? deal.customerId : deal.companyId;

    return contactId ? [contactId] : [];
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
