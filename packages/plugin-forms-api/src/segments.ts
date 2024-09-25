import {
  fetchByQuery,
  fetchByQueryWithScroll,
  getRealIdFromElk,
} from '@erxes/api-utils/src/elasticsearch';
import {
  gatherAssociatedTypes,
  getEsIndexByContentType,
  getName,
  getServiceName,
} from '@erxes/api-utils/src/segments';
import * as _ from 'underscore';
import { sendCommonMessage } from './messageBroker';

const changeType = (type: string) =>
  type === 'contacts:lead' ? 'contacts:customer' : type;

const successMessage = ids => {
  return { data: ids, status: 'success' };
};

export default {
  dependentServices: [{ name: 'contacts', twoWay: true }],

  contentTypes: [
    {
      type: 'form_submission',
      description: 'Form submission',
      esIndex: 'form_submissions',
      hideInSidebar: true,
    },
  ],
  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery },
  }) => {
    const associatedTypes: string[] = await gatherAssociatedTypes(
      changeType(mainType)
    );

    let ids: string[] = [];

    if (
      associatedTypes.includes(propertyType) ||
      propertyType === 'contacts:lead'
    ) {
      const mainTypeIds = (
        await fetchByQueryWithScroll({
          subdomain,
          index: await getEsIndexByContentType(propertyType),
          positiveQuery,
          negativeQuery,
        })
      ).map(id => getRealIdFromElk(id));

      ids = await sendCommonMessage({
        serviceName: 'core',
        subdomain,
        action: 'conformities.filterConformity',
        data: {
          mainType: getName(changeType(propertyType)),
          mainTypeIds,
          relType: getName(changeType(mainType)),
        },
        isRPC: true,
      });

      return successMessage(ids);
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
};
