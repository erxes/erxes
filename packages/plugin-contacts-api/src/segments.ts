import {
  fetchByQuery,
  fetchByQueryWithScroll,
} from '@erxes/api-utils/src/elasticsearch';
import {
  gatherAssociatedTypes,
  getEsIndexByContentType,
  getName,
  getServiceName,
} from '@erxes/api-utils/src/segments';
import * as _ from 'underscore';
import { sendCommonMessage, sendCoreMessage } from './messageBroker';
const successMessage = (ids) => {
  return { data: ids, status: 'success' };
};

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
      notAssociated: true,
    },
  ],

  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery },
  }) => {
    const associatedTypes: string[] = await gatherAssociatedTypes(
      changeType(mainType),
    );

    let ids: string[] = [];

    if (
      associatedTypes.includes(propertyType) ||
      propertyType === 'contacts:lead'
    ) {
      const mainTypeIds = await fetchByQueryWithScroll({
        subdomain,
        index: await getEsIndexByContentType(propertyType),
        positiveQuery,
        negativeQuery,
      });

      console.log({ mainTypeIds });

      ids = await sendCoreMessage({
        subdomain,
        action: 'conformities.filterConformity',
        data: {
          mainType: getName(changeType(propertyType)),
          mainTypeIds,
          relType: getName(changeType(mainType)),
        },
        isRPC: true,
      });

      // console.log({ids})

      return successMessage(ids);
    }

    if (propertyType === 'forms:form_submission') {
      ids = await fetchByQuery({
        subdomain,
        index: 'form_submissions',
        _source: 'customerId',
        positiveQuery,
        negativeQuery,
      });
    } else {
      const serviceName = getServiceName(propertyType);

      if (serviceName === 'contacts') {
        return { data: [], status: 'error' };
      }

      ids = await sendCommonMessage({
        serviceName,
        subdomain,
        action: 'segments.associationFilter',
        data: {
          mainType,
          propertyType,
          positiveQuery,
          negativeQuery,
        },
        defaultValue: [],
        isRPC: true,
      });
    }

    ids = _.uniq(ids);

    return successMessage(ids);
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async () => {
    const negative = {
      term: {
        status: 'deleted',
      },
    };

    return { data: { negative }, status: 'success' };
  },
};
