import type { TAgentReferenceType } from './parseAgentReferences';

export interface IAgentPageRecord {
  type: TAgentReferenceType;
  id: string;
}

/**
 * Inverse of the reference target paths: recognizes the record a known
 * detail page currently shows from its query param, so the chat can carry
 * it as `pageContext.record`.
 */
const LOCATION_RECORD_MATCHERS: {
  pathPrefix: string;
  param: string;
  type: TAgentReferenceType;
}[] = [
  {
    pathPrefix: '/contacts/customers',
    param: 'contactId',
    type: 'customer',
  },
  {
    pathPrefix: '/contacts/companies',
    param: 'companyId',
    type: 'company',
  },
  {
    pathPrefix: '/settings/team/members',
    param: 'user_id',
    type: 'user',
  },
  {
    pathPrefix: '/settings/products',
    param: 'product_id',
    type: 'product',
  },
  {
    pathPrefix: '/settings/structures',
    param: 'entity_id',
    type: 'structureEntity',
  },
  { pathPrefix: '/settings/brands', param: 'brand_id', type: 'brand' },
  { pathPrefix: '/sales/deals', param: 'salesItemId', type: 'deal' },
  {
    pathPrefix: '/frontline/inbox',
    param: 'conversationId',
    type: 'conversation',
  },
];

export const getPageRecordFromLocation = (
  pathname: string,
  search: string,
): IAgentPageRecord | undefined => {
  const params = new URLSearchParams(search);

  for (const matcher of LOCATION_RECORD_MATCHERS) {
    if (
      (pathname === matcher.pathPrefix ||
        pathname.startsWith(`${matcher.pathPrefix}/`)) &&
      params.get(matcher.param)
    ) {
      return { type: matcher.type, id: params.get(matcher.param) as string };
    }
  }

  return undefined;
};
