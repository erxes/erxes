import * as _ from "lodash";
import { sendTRPCMessage } from 'erxes-api-shared/utils';

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

export const getChildTags = async (
  subdomain: string,
  tagIds: string[],
) => {
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

  const foundTagIds = childs.map((ch: any) => ch._id);
  return Array.from(new Set(foundTagIds));
};

export const checkCondition = async (
  subdomain,
  pdata,
  condition,
  productById
) => {
  let categoryRes = true;
  let tagRes = true;
  let segmentRes = true;
  let numberRes = true;
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
    if (product.subUoms && product.subUoms.length) {
      const ratio = product.subUoms[0].ratio || 0;
      if (ratio) {
        const checkCount = Math.round((1 / ratio) * 100) / 100;
        if (
          (condition.subUomType === "lt" && pdata.quantity < checkCount) ||
          (condition.subUomType === "gte" && pdata.quantity >= checkCount)
        ) {
          checkUomRes = true;
        }
      }
    } else {
      checkUomRes = true;
    }
  }

  if (!checkUomRes) {
    return false;
  }

  if (condition.productCategoryIds && condition.productCategoryIds.length) {
    categoryRes = false;
    const product = productById[pdata.productId];

    if (
      !(condition.excludeProductIds || []).includes(product._id) &&
      condition.calcedCatIds.includes(product.categoryId)
    ) {
      categoryRes = true;
    }
  }

  if (!categoryRes) {
    return false;
  }

  if (condition.productTagIds && condition.productTagIds.length) {
    tagRes = false;
    const product = productById[pdata.productId];

    if (
      !(condition.excludeProductIds || []).includes(product._id) &&
      _.intersection(condition.calcedTagIds, product.tagIds).length
    ) {
      tagRes = true;
    }
  }

  if (!tagRes) {
    return false;
  }

  if (condition.segmentIds?.length) {
    segmentRes = false;

    for (const segmentId of condition.segmentIds) {
      const inSegment = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'segments',
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

  if (!segmentRes) {
    return false;
  }

  return categoryRes && segmentRes && numberRes && checkUomRes && tagRes;
};

const getCustomerName = customer => {
  if (!customer) {
    return "";
  }

  if (customer.firstName && customer.lastName) {
    return `${customer.firstName} - ${customer.lastName}`;
  }

  if (customer.firstName) {
    return customer.firstName;
  }

  if (customer.lastName) {
    return customer.lastName;
  }

  if (customer.primaryEmail) {
    return customer.primaryEmail;
  }

  if (customer.primaryPhone) {
    return customer.primaryPhone;
  }

  return "";
};

export const getCustomer = async (subdomain, deal) => {
  const companyIds =
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'conformities',
      action: 'savedConformity',
      method: 'query',
      input: {
        mainType: 'deal',
        mainTypeId: deal._id,
        relTypes: ['company'],
      },
      defaultValue: [],
    })) || [];

  if (companyIds.length) {
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

    if (companies.length) {
      const company = companies[0];

      return {
        customerCode: company.code,
        customerName: company.primaryName
      };
    }
  }

  const customerIds =
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'conformities',
      action: 'savedConformity',
      method: 'query',
      input: {
        mainType: 'deal',
        mainTypeId: deal._id,
        relTypes: ['customer'],
      },
      defaultValue: [],
    })) || [];

  if (customerIds.length > 0) {
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
      })) || []

    let customer = customers.find(c => c.code && c.code.match(/^\d{8}$/g));

    if (customer) {
      return {
        customerCode: customer.code || "",
        customerName: getCustomerName(customer)
      };
    } else {
      if (customers.length) {
        customer = customers[0];
        return {
          customerCode: customer.code || "",
          customerName: getCustomerName(customer)
        };
      }
    }
  }
  return {};
};
