import {
  COMPANY_LINK_DATA,
  CONTACT_CREATED_DATA,
  CONTACT_DELETED_DATA,
  CONTACT_MERGED_DATA,
  CONTACT_TAGGED_DATA,
  CONTACT_UPDATED_DATA,
  LEAD_DATA,
  SIGN_IN_DATA,
} from './eventData';
import { event } from './eventTypeInfo';

export const CONTACT_EVENT_TYPES = [
  {
    ...event(
      'core.customer.created',
      'Customer created',
      'customer',
      'A person is added (by hand, an import, a form or a plugin)',
    ),
    ...CONTACT_CREATED_DATA,
  },
  {
    ...event(
      'core.customer.updated',
      'Customer updated',
      'customer',
      'A person’s fields, owner or properties change',
    ),
    ...CONTACT_UPDATED_DATA,
  },
  {
    ...event(
      'core.customer.deleted',
      'Customer deleted',
      'customer',
      'A person is deleted (to the recycle bin)',
    ),
    ...CONTACT_DELETED_DATA,
  },
  {
    ...event(
      'core.customer.merged',
      'Customers merged',
      'customer',
      'Duplicates are merged into one person',
    ),
    ...CONTACT_MERGED_DATA,
  },
  {
    ...event(
      'core.customer.tagged',
      'Customer tagged',
      'customer',
      'Tags are added to or removed from a person',
    ),
    ...CONTACT_TAGGED_DATA,
  },
  {
    ...event(
      'core.customer.company_linked',
      'Customer linked to a company',
      'customer',
      'A person is linked to a company',
    ),
    ...COMPANY_LINK_DATA,
  },
  {
    ...event(
      'core.customer.company_unlinked',
      'Customer unlinked from a company',
      'customer',
      'A person is unlinked from a company',
    ),
    ...COMPANY_LINK_DATA,
  },
  {
    ...event(
      'core.customer.signed_up',
      'Customer signed up',
      'customer',
      'A person makes an account on one of your portals',
    ),
    ...SIGN_IN_DATA,
  },
  {
    ...event(
      'core.customer.signed_in',
      'Customer signed in',
      'customer',
      'A person signs in to one of your portals with a code',
    ),
    ...SIGN_IN_DATA,
  },
  {
    ...event(
      'core.lead.stage_changed',
      'Lead moved to another stage',
      'customer',
      'A lead (person or company) moves to another stage',
    ),
    ...LEAD_DATA,
  },
  {
    ...event(
      'core.lead.converted',
      'Lead became a customer',
      'customer',
      'A lead becomes a customer',
    ),
    ...LEAD_DATA,
  },
  {
    ...event('core.company.created', 'Company created', 'company', 'A company is added'),
    ...CONTACT_CREATED_DATA,
  },
  {
    ...event(
      'core.company.updated',
      'Company updated',
      'company',
      'A company’s fields, owner or properties change',
    ),
    ...CONTACT_UPDATED_DATA,
  },
  {
    ...event(
      'core.company.deleted',
      'Company deleted',
      'company',
      'A company is deleted (to the recycle bin)',
    ),
    ...CONTACT_DELETED_DATA,
  },
  {
    ...event(
      'core.company.merged',
      'Companies merged',
      'company',
      'Duplicate companies are merged into one',
    ),
    ...CONTACT_MERGED_DATA,
  },
  {
    ...event(
      'core.company.tagged',
      'Company tagged',
      'company',
      'Tags are added to or removed from a company',
    ),
    ...CONTACT_TAGGED_DATA,
  },
  event(
    'core.customer.restored',
    'Customer restored',
    'customer',
    'A deleted person is restored from the recycle bin',
  ),
  event(
    'core.company.restored',
    'Company restored',
    'company',
    'A deleted company is restored from the recycle bin',
  ),
];
