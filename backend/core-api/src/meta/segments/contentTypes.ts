import { ISegmentContentType } from 'erxes-api-shared/core-modules';

/** Entities in core a segment can be built against. */
export const CORE_SEGMENT_CONTENT_TYPES: ISegmentContentType[] = [
  {
    contentType: 'core:organization.users',
    moduleName: 'organization',
    type: 'users',
    description: 'Team member',
    esIndex: 'users',
  },
  {
    contentType: 'core:contacts.companies',
    moduleName: 'contacts',
    type: 'companies',
    description: 'Company',
    esIndex: 'companies',
  },
  {
    contentType: 'core:contacts.customers',
    moduleName: 'contacts',
    type: 'customers',
    description: 'Customer',
    esIndex: 'customers',
  },
  {
    contentType: 'core:contacts.leads',
    // Leads share the customers collection, so nothing ever emits an event
    // named after them. The one type whose event is not its own name.
    eventTypes: ['core:contacts.customers'],
    moduleName: 'contacts',
    type: 'leads',
    description: 'Lead',
    esIndex: 'customers',
    notAssociated: true,
  },
  {
    contentType: 'core:products.products',
    moduleName: 'products',
    type: 'product',
    description: 'Product',
    esIndex: 'products',
  },
];
