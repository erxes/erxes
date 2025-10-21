import {
  gatherAssociatedTypes,
  getContentType,
  getEsIndexByContentType,
  getPluginName,
  initSegmentProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from './connectionResolvers';
import {
  fetchByQuery,
  fetchByQueryWithScroll,
  getRealIdFromElk,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import _ from 'underscore';
import { Express } from 'express';

const changeType = (type: string) =>
  type === 'core:lead' ? 'core:customer' : type;

export const initSegmentCoreProducers = (app: Express) =>
  initSegmentProducers(app, 'core', {
    contentTypes: [
      {
        type: 'user',
        description: 'Team member',
        esIndex: 'users',
      },
      {
        type: 'form_submission',
        description: 'Form submission',
        esIndex: 'form_submissions',
        hideInSidebar: true,
      },
      { type: 'company', description: 'Company', esIndex: 'companies' },
      { type: 'customer', description: 'Customer', esIndex: 'customers' },
      {
        type: 'lead',
        description: 'Lead',
        esIndex: 'customers',
        notAssociated: true,
      },
      { type: 'product', description: 'Product', esIndex: 'products' },
    ],
    esTypesMap: async () => {
      return { typesMap: {} };
    },

    initialSelector: async () => {
      const negative = {
        term: {
          status: 'deleted',
        },
      };

      return { negative };
    },

    associationFilter: async (
      { subdomain },
      { mainType, propertyType, positiveQuery, negativeQuery },
    ) => {
      const associatedTypes: string[] = await gatherAssociatedTypes(
        changeType(mainType),
      );

      let ids: string[] = [];

      if (
        associatedTypes
          .filter((type) => type !== 'core:form_submission')
          .includes(propertyType) ||
        propertyType === 'core:lead'
      ) {
        const models = await generateModels(subdomain);

        const mainTypeIds = (
          await fetchByQueryWithScroll({
            subdomain,
            index: await getEsIndexByContentType(propertyType),
            positiveQuery,
            negativeQuery,
          })
        ).map((id) => getRealIdFromElk(id));

        return await models.Conformities.filterConformity({
          mainType: getContentType(changeType(propertyType)),
          mainTypeIds,
          relType: getContentType(changeType(mainType)),
        });
      }

      if (propertyType === 'core:form_submission') {
        ids = await fetchByQuery({
          subdomain,
          index: 'form_submissions',
          _source: 'customerId',
          positiveQuery,
          negativeQuery,
        });
      } else {
        const serviceName = getPluginName(propertyType);

        if (propertyType.includes('customer', 'company')) {
          return { data: [], status: 'error' };
        }

        if (serviceName === 'core') {
          return { data: [], status: 'error' };
        }

        ids = await sendTRPCMessage({
          pluginName: serviceName,
          method: 'query',
          module: 'segments',
          action: 'associationFilter',
          input: {
            mainType,
            propertyType,
            positiveQuery,
            negativeQuery,
          },
          defaultValue: [],
        });
      }

      ids = _.uniq(ids);

      return ids;
    },
  });
