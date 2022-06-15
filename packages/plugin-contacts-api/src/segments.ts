import * as _ from 'underscore';
import { fetchByQuery } from '@erxes/api-utils/src/elasticsearch';
import { sendCoreMessage } from './messageBroker';

const indexesTypeContentType = {
  'contacts:lead': 'customers',
  'contacts:customer': 'customers',
  'contacts:company': 'companies',
  'cards:deal': 'deals',
  'cards:task': 'tasks',
  'cards:ticket': 'tickets',
  'inbox:conversation': 'conversations'
};

const getName = type => type.replace('contacts:', '').replace('cards:', '');

export default {
  indexesTypeContentType,
  associationTypes: [
    'contacts:lead',
    'contacts:customer',
    'contacts:company',
    'cards:deal',
    'cards:ticket',
    'cards:task',
    'inbox:conversation',
    'forms:form_submission'
  ],

  contentTypes: ['lead', 'customer', 'company'],

  descriptionMap: {
    deal: 'Deal',
    ticket: 'Ticket',
    task: 'Task',
    lead: 'Lead',
    customer: 'Customer',
    company: 'Company',
    conversation: 'Conversation',
    form_submission: 'Form Submission'
  },

  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery }
  }) => {
    let associatedTypes: string[] = [];

    if (['contacts:customer', 'contacts:lead'].includes(mainType)) {
      associatedTypes = [
        'contacts:company',
        'cards:deal',
        'cards:ticket',
        'cards:task'
      ];
    }

    if (mainType === 'contacts:company') {
      associatedTypes = [
        'contacts:customer',
        'cards:deal',
        'cards:ticket',
        'cards:task'
      ];
    }

    let ids: string[] = [];

    if (associatedTypes.includes(propertyType)) {
      const mainTypeIds = await fetchByQuery({
        subdomain,
        index: indexesTypeContentType[propertyType],
        positiveQuery,
        negativeQuery
      });

      ids = await sendCoreMessage({
        subdomain,
        action: 'conformities.filterConformity',
        data: {
          mainType: getName(propertyType),
          mainTypeIds,
          relType: getName(
            mainType === 'contacts:lead' ? 'contacts:customer' : mainType
          )
        },
        isRPC: true
      });
    }

    if (propertyType === 'forms:form_submission') {
      ids = await fetchByQuery({
        subdomain,
        index: 'form_submissions',
        _source: 'customerId',
        positiveQuery,
        negativeQuery
      });

      ids = _.uniq(ids);
    }

    return { data: ids, status: 'success' };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async () => {
    const negative = {
      term: {
        status: 'deleted'
      }
    };

    return { data: { negative }, status: 'success' };
  }
};
