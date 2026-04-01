import * as _ from 'lodash';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '../../../connectionResolvers';

// OLD function - keep for backward compatibility
export const getConfig = async (subdomain, code, defaultValue?) => {
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'configs',
    action: 'getConfig',
    method: 'query',
    input: { code, defaultValue },
    defaultValue,
  });
};

// NEW function for mnConfigs (direct model access)
export const getMnConfig = async (
  subdomain,
  code,
  subId = '',
  defaultValue = null,
) => {
  try {
    const models = await generateModels(subdomain);

    const result = await models.Configs.findOne({
      code,
      subId,
    }).lean();

    if (result?.value && Array.isArray(result.value)) {
      return result.value.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    }

    return defaultValue;
  } catch {
    return defaultValue;
  }
};

// Get multiple configs (direct model access)
export const getMnConfigs = async (subdomain, codes: string[], subId = '') => {
  try {
    const models = await generateModels(subdomain);

    const results = await Promise.all(
      codes.map(async (code) => {
        let config = await models.Configs.findOne({
          code,
          subId,
        }).lean();

        if (!config && subId) {
          config = await models.Configs.findOne({
            code,
            subId: '',
          }).lean();
        }

        if (config?.value && Array.isArray(config.value)) {
          return config.value.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {});
        }

        return null;
      }),
    );

    return results;
  } catch {
    return codes.map(() => null);
  }
};

export const getChildCategories = async (
  subdomain: string,
  categoryIds: string[],
) => {
  const childs =
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'categories',
      action: 'withChilds',
      method: 'query',
      input: { ids: categoryIds },
      defaultValue: [],
    })) || [];

  const catIds = childs.map((ch: any) => ch._id);
  return Array.from(new Set(catIds));
};

export const getChildTags = async (subdomain: string, tagIds: string[]) => {
  const childs =
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'tags',
      action: 'tagWithChilds',
      method: 'query',
      input: {
        query: { _id: { $in: tagIds } },
        fields: { _id: 1 },
      },
      defaultValue: [],
    })) || [];

  if (!Array.isArray(childs)) return [];

  if (childs.length > 0 && typeof childs[0] === 'string') {
    return childs;
  }

  const foundTagIds = childs.map((ch: any) => ch?._id).filter(Boolean);
  return Array.from(new Set(foundTagIds));
};

export const checkCondition = async (
  subdomain,
  pdata,
  condition,
  productById,
) => {
  let categoryRes = true;
  let tagRes = true;
  let segmentRes = true;
  let checkUomRes = true;

  if (condition.gtCount !== undefined && pdata.quantity <= condition.gtCount) {
    return false;
  }

  if (condition.ltCount !== undefined && pdata.quantity >= condition.ltCount) {
    return false;
  }

  if (
    condition.gtUnitPrice !== undefined &&
    pdata.unitPrice <= condition.gtUnitPrice
  ) {
    return false;
  }

  if (
    condition.ltUnitPrice !== undefined &&
    pdata.unitPrice >= condition.ltUnitPrice
  ) {
    return false;
  }

  if (condition.subUomType) {
    checkUomRes = false;
    const product = productById[pdata.productId];

    if (product?.subUoms?.length) {
      const ratio = product.subUoms[0].ratio || 0;

      if (ratio) {
        const checkCount = Math.round((1 / ratio) * 100) / 100;

        if (
          (condition.subUomType === 'lt' && pdata.quantity < checkCount) ||
          (condition.subUomType === 'gte' && pdata.quantity >= checkCount)
        ) {
          checkUomRes = true;
        }
      }
    } else {
      checkUomRes = true;
    }
  }

  if (!checkUomRes) return false;

  if (condition.productCategoryIds?.length) {
    categoryRes = false;
    const product = productById[pdata.productId];

    if (
      !(condition.excludeProductIds || []).includes(product._id) &&
      product?.categoryId &&
      condition.calcedCatIds.includes(product.categoryId)
    ) {
      categoryRes = true;
    }
  }

  if (!categoryRes) return false;

  if (condition.productTagIds?.length) {
    tagRes = false;
    const product = productById[pdata.productId];

    // 🔥 FORCE fetch tags from pdata fallback if missing
    const productTagIds =
      product?.tagIds ||
      pdata?.tagIds || // sometimes exists
      [];

    if (
      !(condition.excludeProductIds || []).includes(product?._id) &&
      _.intersection(condition.calcedTagIds, productTagIds).length > 0
    ) {
      tagRes = true;
    }
  }

  if (!tagRes) return false;

  if (condition.segmentIds?.length) {
    segmentRes = false;

    for (const segmentId of condition.segmentIds) {
      const inSegment = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'segment',
        action: 'isInSegment',
        method: 'query',
        input: {
          segmentId,
          idToCheck: pdata.productId,
        },
        defaultValue: false,
      });

      if (inSegment) {
        segmentRes = true;
        break;
      }
    }
  }

  if (!segmentRes) return false;

  return categoryRes && segmentRes && checkUomRes && tagRes;
};

const getCustomerName = (customer) => {
  if (!customer) return '';

  if (customer.firstName && customer.lastName) {
    return `${customer.firstName} - ${customer.lastName}`;
  }

  if (customer.firstName) return customer.firstName;
  if (customer.lastName) return customer.lastName;
  if (customer.primaryEmail) return customer.primaryEmail;
  if (customer.primaryPhone) return customer.primaryPhone;

  return '';
};

export const getCustomer = async (subdomain, deal) => {
  const companyIds =
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'getRelationIds',
      input: {
        contentType: 'sales:deal',
        contentId: deal._id,
        relatedContentType: 'core:company',
      },
      defaultValue: [],
    })) || [];

  if (companyIds?.length) {
    const companies =
      (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'companies',
        action: 'findActiveCompanies',
        method: 'query',
        input: {
          selector: { _id: { $in: companyIds } },
          fields: { _id: 1, code: 1, primaryName: 1 },
        },
        defaultValue: [],
      })) || [];

    if (companies?.length) {
      const company = companies[0];

      return {
        customerCode: company.code,
        customerName: company.primaryName,
      };
    }
  }

  const customerIds =
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'getRelationIds',
      input: {
        contentType: 'sales:deal',
        contentId: deal._id,
        relatedContentType: 'core:customer',
      },
      defaultValue: [],
    })) || [];

  if (customerIds?.length) {
    const customers =
      (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'customers',
        action: 'findActiveCustomers',
        method: 'query',
        input: {
          selector: { _id: { $in: customerIds } },
          fields: {
            _id: 1,
            code: 1,
            firstName: 1,
            lastName: 1,
            primaryEmail: 1,
            primaryPhone: 1,
          },
        },
        defaultValue: [],
      })) || [];

    let customer = customers.find((c) => c.code?.match(/^\d{8}$/g));

    if (customer) {
      return {
        customerCode: customer.code || '',
        customerName: getCustomerName(customer),
      };
    }

    if (customers.length) {
      customer = customers[0];

      return {
        customerCode: customer.code || '',
        customerName: getCustomerName(customer),
      };
    }
  }

  return {};
};
