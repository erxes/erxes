import * as _ from 'underscore';
import { fetchByQuery } from '@erxes/api-utils/src/elasticsearch';
import {
  gatherAssociatedTypes,
  getEsIndexByContentType,
  getName
} from '@erxes/api-utils/src/segments';
import { sendCoreMessage } from './messageBroker';

const changeType = (type: string) =>
  type === 'contacts:lead' ? 'contacts:customer' : type;

export default {
  contentTypes: [
    { type: 'company', description: 'Company', esIndex: 'companies' },
    { type: 'customer', description: 'Customer', esIndex: 'customers' },
    {
      type: 'lead',
      description: 'Lead',
      esIndex: 'customers',
      notAssociated: true
    }
  ],

  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery }
  }) => {
    const associatedTypes: string[] = await gatherAssociatedTypes(
      changeType(mainType)
    );

    let ids: string[] = [];

    if (associatedTypes.includes(propertyType)) {
      const mainTypeIds = await fetchByQuery({
        subdomain,
        index: await getEsIndexByContentType(propertyType),
        positiveQuery,
        negativeQuery
      });

      ids = await sendCoreMessage({
        subdomain,
        action: 'conformities.filterConformity',
        data: {
          mainType: getName(propertyType),
          mainTypeIds,
          relType: getName(changeType(mainType))
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
