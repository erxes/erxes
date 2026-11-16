import { type AssistantPage, AssistantRecordType } from '@erxes/core-contract';
import { matchPath } from 'react-router-dom';
import { MEMBER_CONTENT_TYPE } from 'erxes-ui';
import { paths } from '~/lib/paths';

const RECORD_PAGES: Record<AssistantRecordType, string[]> = {
  customer: ['/contacts/customers/:id', '/contacts/leads/:id'],
  company: ['/contacts/companies/:id'],
  member: ['/settings/team-members/:id'],
  product: ['/products/:id'],
  automation: ['/automations/:id'],
};

const RECORD_ID = /^[\w-]{1,64}$/;

const PATH = /^\/(?!\/)[\w\-./~%]{0,199}$/;

const RECORD_LINKS: Record<AssistantRecordType, (id: string) => string> = {
  customer: paths.contacts.customer,
  company: paths.contacts.company,
  member: paths.settings.teamMember,
  product: paths.products.product,
  automation: paths.automations.automation,
};

/** How the side panel names each record type it can show. */
export const RECORD_CONTENT_TYPES: Partial<Record<AssistantRecordType, string>> = {
  customer: 'core:customer',
  company: 'core:company',
  member: MEMBER_CONTENT_TYPE,
  product: 'core:product',
};

export const recordOfContentType = (contentType: string, id: string) => {
  const type = AssistantRecordType.options.find(
    (item) => RECORD_CONTENT_TYPES[item] === contentType,
  );

  return type ? { type, id } : undefined;
};

export const recordPath = (type: AssistantRecordType, id: string) => RECORD_LINKS[type](id);

const recordOfPath = (pathname: string) =>
  AssistantRecordType.options
    .flatMap((type) =>
      RECORD_PAGES[type].map((page) => ({
        type,
        id: matchPath(page, pathname)?.params['id'] ?? '',
      })),
    )
    .find(({ id }) => RECORD_ID.test(id));

export const pageOfPath = (pathname: string): AssistantPage | null => {
  if (!PATH.test(pathname)) return null;

  const record = recordOfPath(pathname);

  return { path: pathname, ...(record ? { record } : {}) };
};
