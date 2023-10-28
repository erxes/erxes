import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage,
  sendSegmentsMessage
} from '../messageBroker';

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendProductsMessage({
    subdomain,
    action: 'categories.withChilds',
    data: { ids: categoryIds },
    isRPC: true,
    defaultValue: []
  });

  const catIds: string[] = (childs || []).map(ch => ch._id) || [];
  return Array.from(new Set(catIds));
};

export const checkCondition = async (
  subdomain,
  pdata,
  condition,
  productById
) => {
  let categoryRes = true;
  let segmentRes = true;
  let numberRes = true;
  let checkUomRes = true;

  if (
    condition.gtCount ||
    condition.ltCount ||
    condition.gtUnitPrice ||
    condition.ltUnitPrice
  ) {
    numberRes = false;

    if (condition.gtCount) {
      if (pdata.quantity <= condition.gtCount) {
        numberRes = true;
      } else {
        numberRes = false;
      }
    }

    if (condition.ltCount) {
      if (pdata.quantity >= condition.ltCount) {
        numberRes = true;
      } else {
        numberRes = false;
      }
    }

    if (condition.gtUnitPrice) {
      if (pdata.unitPrice <= condition.gtUnitPrice) {
        numberRes = true;
      } else {
        numberRes = false;
      }
    }

    if (condition.ltUnitPrice) {
      if (pdata.unitPrice >= condition.ltUnitPrice) {
        numberRes = true;
      } else {
        numberRes = false;
      }
    }
  }

  if (!numberRes) {
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

  if (condition.segmentIds && condition.segmentIds.length) {
    segmentRes = false;
    for (const segmentId of condition.segmentIds) {
      if (
        await sendSegmentsMessage({
          subdomain,
          action: 'isInSegment',
          data: { segmentId, idToCheck: pdata.productId }
        })
      ) {
        segmentRes = true;
        continue;
      }
    }
  }

  if (!segmentRes) {
    return false;
  }

  return categoryRes && segmentRes && numberRes && checkUomRes;
};

const getCustomerName = customer => {
  if (!customer) {
    return '';
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

  return '';
};

export const getCustomer = async (subdomain, deal) => {
  const companyIds = await sendCoreMessage({
    subdomain,
    action: 'conformities.savedConformity',
    data: { mainType: 'deal', mainTypeId: deal._id, relTypes: ['company'] },
    isRPC: true,
    defaultValue: []
  });

  if (companyIds.length > 0) {
    const companies = await sendContactsMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: {
        selector: { _id: { $in: companyIds } },
        fields: { _id: 1, code: 1, primaryName: 1 }
      },
      isRPC: true,
      defaultValue: []
    });

    if (companies.length) {
      const company = companies[0];

      return {
        customerCode: company.code,
        customerName: company.primaryName
      };
    }
  }

  const customerIds = await sendCoreMessage({
    subdomain,
    action: 'conformities.savedConformity',
    data: { mainType: 'deal', mainTypeId: deal._id, relTypes: ['customer'] },
    isRPC: true,
    defaultValue: []
  });

  if (customerIds.length > 0) {
    const customers = await sendContactsMessage({
      subdomain,
      action: 'customers.findActiveCustomers',
      data: {
        selector: { _id: { $in: customerIds } },
        fields: {
          _id: 1,
          code: 1,
          firstName: 1,
          lastName: 1,
          primaryEmail: 1,
          primaryPhone: 1
        }
      },
      isRPC: true,
      defaultValue: []
    });

    let customer = customers.find(c => c.code && c.code.match(/^\d{8}$/g));

    if (customer) {
      return {
        customerCode: customer.code || '',
        customerName: getCustomerName(customer)
      };
    } else {
      if (customers.length) {
        customer = customers[0];
        return {
          customerCode: customer.code || '',
          customerName: getCustomerName(customer)
        };
      }
    }
  }
  return {};
};
