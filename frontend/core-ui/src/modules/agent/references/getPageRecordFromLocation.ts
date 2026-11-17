import { ProductsPath } from '@/types/paths/ProductsPath';
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
    pathPrefix: '/settings/structures/branches',
    param: 'branch_id',
    type: 'branch',
  },
  {
    pathPrefix: '/settings/structures/departments',
    param: 'department_id',
    type: 'department',
  },
  {
    pathPrefix: '/settings/structures/units',
    param: 'unit_id',
    type: 'unit',
  },
  { pathPrefix: '/settings/brands', param: 'brand_id', type: 'brand' },
  { pathPrefix: '/sales/deals', param: 'salesItemId', type: 'deal' },
  {
    pathPrefix: '/frontline/inbox',
    param: 'conversationId',
    type: 'conversation',
  },
];

// A contact's own page carries its id in the path.
const CONTACT_PAGE = /^\/contacts\/(customers|leads|companies)\/([^/]+)/;

// So does a product's, beside the product settings pages that share the path.
const PRODUCT_PAGE = /^\/settings\/products\/([^/]+)\/?$/;
const PRODUCT_SETTINGS_PAGES = new Set(
  Object.values(ProductsPath)
    .filter((path) => path.startsWith(`${ProductsPath.Products}/`))
    .map((path) => path.slice(ProductsPath.Products.length + 1)),
);

export const getPageRecordFromLocation = (
  pathname: string,
  search: string,
): IAgentPageRecord | undefined => {
  const contactPage = CONTACT_PAGE.exec(pathname);

  if (contactPage) {
    return {
      type: contactPage[1] === 'companies' ? 'company' : 'customer',
      id: contactPage[2],
    };
  }

  const productPage = PRODUCT_PAGE.exec(pathname);

  if (productPage && !PRODUCT_SETTINGS_PAGES.has(productPage[1])) {
    return { type: 'product', id: productPage[1] };
  }

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
