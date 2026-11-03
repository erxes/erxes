import { sendTRPCMessage } from 'erxes-api-shared/utils';

type TDealContacts = {
  _id: string;
  customerId?: string | null;
  companyId?: string | null;
};

/**
 * A deal's customer or company id, as a list of at most one: the deal keeps
 * one of each itself. Given only its id, the deal is read from sales.
 */
export const getDealContactIds = async (
  subdomain: string,
  deal: TDealContacts | string,
  kind: 'customer' | 'company',
): Promise<string[]> => {
  const doc: TDealContacts | null =
    typeof deal === 'string'
      ? await sendTRPCMessage({
          subdomain,
          pluginName: 'sales',
          method: 'query',
          module: 'deal',
          action: 'findOne',
          input: { _id: deal },
          defaultValue: null,
        })
      : deal;
  const contactId = kind === 'customer' ? doc?.customerId : doc?.companyId;

  return contactId ? [contactId] : [];
};
