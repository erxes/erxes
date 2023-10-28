import * as _ from 'lodash';
import { IContext } from '../../../connectionResolver';
import {
  sendProductsMessage,
  sendSegmentsMessage
} from '../../../messageBroker';
import { IPricingPlanDocument } from '../../../models/definitions/pricingPlan';
import { getChildCategories } from '../../../utils/product';

const PricingPlan = {
  createdUser(pricingPlan: IPricingPlanDocument) {
    if (!pricingPlan.createdBy) return;

    return {
      __typename: 'User',
      _id: pricingPlan.createdBy
    };
  },

  updatedUser(pricingPlan: IPricingPlanDocument) {
    if (!pricingPlan.updatedBy) return;

    return {
      __typename: 'User',
      _id: pricingPlan.updatedBy
    };
  },

  async productIds(plan: IPricingPlanDocument, _args, { subdomain }: IContext) {
    let productIds: string[] = [];

    switch (plan.applyType) {
      case 'product': {
        productIds = plan.products || [];
        break;
      }

      case 'segment': {
        let productIdsInSegments: string[] = [];
        for (const segment of plan.segments || []) {
          productIdsInSegments = productIdsInSegments.concat(
            await sendSegmentsMessage({
              subdomain,
              action: 'fetchSegment',
              data: { segmentId: segment },
              isRPC: true,
              defaultValue: []
            })
          );
        }
        productIds = productIdsInSegments;
        break;
      }

      case 'vendor': {
        const limit = await sendProductsMessage({
          subdomain,
          action: 'count',
          data: {
            query: {
              vendorId: { $in: plan.vendors || [] }
            }
          },
          isRPC: true,
          defaultValue: 0
        });

        const products = await sendProductsMessage({
          subdomain,
          action: 'find',
          data: {
            query: {
              vendorId: { $in: plan.vendors || [] }
            },
            field: { _id: 1 },
            limit
          },
          isRPC: true,
          defaultValue: []
        });
        productIds = products.map(p => p._id);
        break;
      }

      case 'category': {
        const includeCatIds = await getChildCategories(
          subdomain,
          plan.categories
        );
        const excludeCatIds = await getChildCategories(
          subdomain,
          plan.categoriesExcluded || []
        );

        const plansCategoryIds = includeCatIds.filter(
          c => !excludeCatIds.includes(c)
        );
        const limit = await sendProductsMessage({
          subdomain,
          action: 'count',
          data: {
            query: {
              categoryId: { $in: plansCategoryIds },
              _id: { $nin: plan.productsExcluded }
            }
          },
          isRPC: true,
          defaultValue: 0
        });

        const products = await sendProductsMessage({
          subdomain,
          action: 'find',
          data: {
            query: {
              categoryId: { $in: plansCategoryIds },
              _id: { $nin: plan.productsExcluded }
            },
            field: { _id: 1 },
            limit
          },
          isRPC: true,
          defaultValue: []
        });

        productIds = products.map(p => p._id);
        break;
      }
    }
    return productIds;
  }
};

export { PricingPlan };
