import {
  gatherAssociatedTypes,
  getContentType,
  getPluginName,
  initSegmentProducers,
  splitType,
  TAutomationProducers,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import {
  fetchByQuery,
  fetchByQueryWithScroll,
  getEsIndexByContentType,
  getRealIdFromElk,
  sendCoreModuleProducer,
} from 'erxes-api-shared/utils';
import { Express } from 'express';
import _ from 'underscore';
import { generateModels } from '../connectionResolvers';

const changeType = (type: string) =>
  type === 'core:contact.lead' ? 'core:contact.customer' : type;

export const initSegmentCoreProducers = (app: Express) =>
  initSegmentProducers(app, 'core', {
    contentTypes: [
      {
        moduleName: 'team',
        type: 'user',
        description: 'Team member',
        esIndex: 'users',
      },
      {
        moduleName: 'contact',
        type: 'company',
        description: 'Company',
        esIndex: 'companies',
      },
      {
        moduleName: 'contact',
        type: 'customer',
        description: 'Customer',
        esIndex: 'customers',
      },
      {
        moduleName: 'contact',
        type: 'lead',
        description: 'Lead',
        esIndex: 'customers',
        notAssociated: true,
      },
      {
        moduleName: 'product',
        type: 'product',
        description: 'Product',
        esIndex: 'products',
      },
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

    associationFilter: async ({ subdomain, data }) => {
      const { mainType, propertyType, positiveQuery, negativeQuery } = data;
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
        const [serviceName, _moduleName, collectionType] =
          splitType(propertyType);

        if (['customer', 'company'].includes(collectionType)) {
          return { data: [], status: 'error' };
        }

        if (serviceName === 'core') {
          return { data: [], status: 'error' };
        }

        ids = await sendCoreModuleProducer({
          subdomain,
          pluginName: serviceName,
          method: 'query',
          moduleName: 'segments',
          producerName: TSegmentProducers.ASSOCIATION_FILTER,
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
