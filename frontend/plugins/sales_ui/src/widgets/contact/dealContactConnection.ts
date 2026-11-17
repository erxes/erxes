import { gql } from '~/gql';

export const DEAL_CONNECTION_CONTENT_TYPE = 'sales:dealConnection';

export type TDealConnectionContact = {
  contentType: string;
  contentId: string;
};

export const SALES_DEAL_CONNECTION_CANDIDATES = gql(`
  query salesDealConnectionCandidates(
    $search: String
    $limit: Int
    $cursor: String
  ) {
    deals(
      search: $search
      limit: $limit
      cursor: $cursor
      direction: forward
    ) {
      list {
        _id
        name
        number
        customerId
        companyId
        stage {
          _id
          name
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const SALES_DEAL_CONNECTION_CONTACTS = gql(`
  query salesDealConnectionContacts($_id: String!) {
    dealDetail(_id: $_id) {
      _id
      customerId
      companyId
    }
  }
`);

export const getDealContactUpdate = (
  deal: {
    _id: string;
    customerId?: string | null;
    companyId?: string | null;
  },
  contact: TDealConnectionContact,
): { _id: string; customerId?: string; companyId?: string } | null => {
  if (!contact.contentId) return null;

  if (contact.contentType === 'core:customer' && !deal.customerId) {
    return { _id: deal._id, customerId: contact.contentId };
  }

  if (contact.contentType === 'core:company' && !deal.companyId) {
    return { _id: deal._id, companyId: contact.contentId };
  }

  return null;
};
