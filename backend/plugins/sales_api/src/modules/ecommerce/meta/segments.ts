import { SegmentConfigs } from 'erxes-api-shared/core-modules';
import {
  fetchByQueryWithScroll,
  getEsIndexByContentType,
} from 'erxes-api-shared/utils';
import * as _ from 'underscore';
import { ecommerceSegmentConfigs } from './ecommerceSegmentConfigs';

export const ecommerceSegments = {
  contentTypes: ecommerceSegmentConfigs.contentTypes,

  associationFilter: async ({ data, subdomain }) => {
    const { mainType, propertyType, positiveQuery, negativeQuery } = data;
    let ids: string[] = [];

    const getEcommerceIndex = (type: string) => {
      const config = ecommerceSegmentConfigs.contentTypes.find(
        ct => ct.type === type
      );
      return config ? config.esIndex : `ecommerce_${type}`;
    };

    if (mainType.includes('core:contact')) {

      const ecommerceType = propertyType.split(':')[1] || 'productReview';
      const index = getEcommerceIndex(ecommerceType);

      ids = await fetchByQueryWithScroll({
        subdomain,
        index,
        _source: 'customerId',
        positiveQuery,
        negativeQuery,
      });
    }

    if (propertyType.includes('core:contact')) {
      const customerIds = await fetchByQueryWithScroll({
        subdomain,
        index: await getEsIndexByContentType(propertyType),
        positiveQuery,
        negativeQuery,
      });

      const ecommerceType = mainType.split(':')[1] || 'productReview';
      const index = getEcommerceIndex(ecommerceType);

      let fieldName = 'customerId';
      if (ecommerceType === 'productReview') fieldName = 'customerId';
      if (ecommerceType === 'wishlist') fieldName = 'customerId';
      if (ecommerceType === 'lastViewedItem') fieldName = 'customerId';
      if (ecommerceType === 'address') fieldName = 'customerId';

      ids = await fetchByQueryWithScroll({
        subdomain,
        index,
        _source: '_id',
        positiveQuery: {
          terms: {
            [fieldName]: customerIds,
          },
        },
        negativeQuery: undefined,
      });
    }

    if (mainType.includes('ecommerce:') && propertyType.includes('ecommerce:')) {
      const mainEcommerceType = mainType.split(':')[1];
      const propertyEcommerceType = propertyType.split(':')[1];
      
      const mainIndex = getEcommerceIndex(mainEcommerceType);
      const propertyIndex = getEcommerceIndex(propertyEcommerceType);

      const propertyIds = await fetchByQueryWithScroll({
        subdomain,
        index: propertyIndex,
        _source: '_id',
        positiveQuery,
        negativeQuery,
      });

      let mainField = '_id';
      let propertyField = '_id';

      const relationships = {

        'wishlist-address': { mainField: 'customerId', propertyField: 'customerId' },
        'productReview-address': { mainField: 'customerId', propertyField: 'customerId' },
        'lastViewedItem-address': { mainField: 'customerId', propertyField: 'customerId' },

        'productReview-wishlist': { mainField: 'productId', propertyField: 'productId' },

        'lastViewedItem-productReview': { mainField: 'productId', propertyField: 'productId' },
      };

      const relationshipKey = `${mainEcommerceType}-${propertyEcommerceType}`;
      const reverseKey = `${propertyEcommerceType}-${mainEcommerceType}`;
      
      if (relationships[relationshipKey]) {
        mainField = relationships[relationshipKey].mainField;
        propertyField = relationships[relationshipKey].propertyField;
      } else if (relationships[reverseKey]) {

        mainField = relationships[reverseKey].propertyField;
        propertyField = relationships[reverseKey].mainField;
      } else {
        
        mainField = 'customerId';
        propertyField = 'customerId';
      }

      const propertyItems = await fetchByQueryWithScroll({
        subdomain,
        index: propertyIndex,
        _source: propertyField,
        positiveQuery: {
          terms: {
            _id: propertyIds,
          },
        },
        negativeQuery: undefined,
      });

      const fieldValues = _.uniq(propertyItems.map(item => item[propertyField]));

      ids = await fetchByQueryWithScroll({
        subdomain,
        index: mainIndex,
        _source: '_id',
        positiveQuery: {
          terms: {
            [mainField]: fieldValues,
          },
        },
        negativeQuery: undefined,
      });
    }

    ids = _.uniq(ids);

    return { data: ids, status: 'success' };
  },

  esTypesMap: async (_data, _context) => {

    const typesMap = {
      productReview: {
        _id: { type: 'keyword' },
        productId: { type: 'keyword' },
        customerId: { type: 'keyword' },
        review: { type: 'integer' },
        description: { type: 'text' },
        createdAt: { type: 'date' },
        modifiedAt: { type: 'date' },
      },
      wishlist: {
        _id: { type: 'keyword' },
        productId: { type: 'keyword' },
        customerId: { type: 'keyword' },
        createdAt: { type: 'date' },
        modifiedAt: { type: 'date' },
      },
      lastViewedItem: {
        _id: { type: 'keyword' },
        productId: { type: 'keyword' },
        customerId: { type: 'keyword' },
        modifiedAt: { type: 'date' },
      },
      address: {
        _id: { type: 'keyword' },
        alias: { type: 'keyword' },
        customerId: { type: 'keyword' },
        coordinate: {
          properties: {
            lat: { type: 'float' },
            lng: { type: 'float' },
          },
        },
        address1: { type: 'text' },
        address2: { type: 'text' },
        city: { type: 'keyword' },
        district: { type: 'keyword' },
        street: { type: 'text' },
        detail: { type: 'text' },
        w3w: { type: 'keyword' },
        note: { type: 'text' },
        phone: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    };

    return { data: { typesMap }, status: 'success' };
  },
} as SegmentConfigs;