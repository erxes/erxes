import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import lodash from 'lodash';
import moment from 'moment';
import { IModels } from '~/connectionResolvers';
import { IEbarimt, IEbarimtConfig, IEbarimtFull } from '../@types';
import { IDoc, IPutDataArgs } from '../@types/common';

const isValidBarcode = (barcode: string): boolean => {
  // check length
  if (
    barcode.length < 8 ||
    barcode.length > 18 ||
    (barcode.length != 8 &&
      barcode.length != 12 &&
      barcode.length != 13 &&
      barcode.length != 14 &&
      barcode.length != 18)
  ) {
    return false;
  }

  const lastDigit = Number(barcode.substring(barcode.length - 1));
  let checkSum = 0;
  if (isNaN(lastDigit)) {
    return false;
  } // not a valid upc/ean

  const arr: any = barcode
    .substring(0, barcode.length - 1)
    .split('')
    .reverse();
  let oddTotal = 0,
    evenTotal = 0;

  for (let i = 0; i < arr.length; i++) {
    if (isNaN(arr[i])) {
      return false;
    } // can't be a valid upc/ean we're checking for

    if (i % 2 == 0) {
      oddTotal += Number(arr[i]) * 3;
    } else {
      evenTotal += Number(arr[i]);
    }
  }
  checkSum = (10 - ((evenTotal + oddTotal) % 10)) % 10;

  // true if they are equal
  return checkSum == lastDigit;
};

const getCustomerInfo = async (
  type: string,
  config: IEbarimtConfig,
  doc: IDoc,
) => {
  if (type === 'B2B_RECEIPT') {
    const tinre = /(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/;
    if (tinre.test(doc.customerTin || '')) {
      return { customerTin: doc.customerTin, customerName: doc.customerName };
    }

    const resp = await getCompanyInfo({
      checkTaxpayerUrl: config.checkTaxpayerUrl,
      no: doc.customerTin || doc.customerCode || '',
    });

    if (resp.status !== 'checked' || !resp.tin) {
      return { msg: 'wrong tin number or rd or billType' };
    }
    return { customerTin: resp.tin, customerName: resp.result?.data?.name };
  }

  const re = /^\d{8}$/;
  if (doc.consumerNo && re.test(doc.consumerNo)) {
    return { consumerNo: doc.consumerNo, customerName: doc.customerName };
  }
  return { customerName: doc.customerName };
};

const genStock = (detail, product, config) => {
  const barCode = detail.barcode || (product.barcodes || [])[0] || '';
  const barCodeType = isValidBarcode(barCode) ? 'GS1' : 'UNDEFINED';

  return {
    name: product.shortName || `${product.code} - ${product.name}`,
    barCode,
    barCodeType,
    classificationCode: config.defaultGSCode,
    taxProductCode: product.taxCode,
    measureUnit: product.uom ?? 'ш',
    qty: detail.quantity,
    unitPrice: detail.unitPrice,
    totalBonus: detail.totalDiscount,
    totalAmount: detail.totalAmount,
    totalVAT: 0,
    totalCityTax: 0,
    data: {},
    productId: product._id,
  };
};

const getArrangeProducts = async (config: IEbarimtConfig, doc: IDoc) => {
  const details: any[] = [];
  const detailsFree: any[] = [];
  const details0: any[] = [];
  const detailsInner: any[] = [];
  let ableAmount = 0;
  let freeAmount = 0;
  let zeroAmount = 0;
  let innerAmount = 0;
  let ableVATAmount = 0;
  let ableCityTaxAmount = 0;

  const vatPercent = (config.hasVat && Number(config.vatPercent)) || 0;
  const cityTaxPercent =
    (config.hasCitytax && Number(config.cityTaxPercent)) || 0;
  const totalPercent = vatPercent + cityTaxPercent + 100;

  for (const detail of (doc.details || []).filter((d) => d.product)) {
    const { product } = detail;

    const stock = genStock(detail, product, config);

    if (product.taxType === '2') {
      detailsFree.push({ ...stock });
      freeAmount += detail.totalAmount;
      continue;
    }
    if (product.taxType === '3') {
      details0.push({ ...stock });
      zeroAmount += detail.totalAmount;
      continue;
    }
    if (product.taxType === '5') {
      detailsInner.push({ ...stock });
      innerAmount += detail.totalAmount;
      continue;
    }

    if (
      !config.hasCitytax &&
      config.reverseCtaxRules?.length &&
      product.citytaxCode
    ) {
      // when has a reverseCtitytax
      const pCtaxPercent = Number(product.citytaxPercent) || 0; // productCitytaxPercent per
      const pTotalPercent = vatPercent + pCtaxPercent + 100;

      const totalVAT = (detail.totalAmount / pTotalPercent) * vatPercent;
      const totalCityTax = (detail.totalAmount / pTotalPercent) * pCtaxPercent;
      ableAmount += detail.totalAmount;
      ableVATAmount += totalVAT;
      ableCityTaxAmount += totalCityTax;
      details.push({ ...stock, totalVAT, totalCityTax });
    } else {
      // when a main
      const totalVAT = (detail.totalAmount / totalPercent) * vatPercent;
      const totalCityTax = (detail.totalAmount / totalPercent) * cityTaxPercent;
      ableAmount += detail.totalAmount;
      ableVATAmount += totalVAT;
      ableCityTaxAmount += totalCityTax;
      details.push({ ...stock, totalVAT, totalCityTax });
    }
  }

  return {
    details,
    detailsFree,
    details0,
    detailsInner,
    ableAmount: fixNum(ableAmount),
    freeAmount: fixNum(freeAmount),
    zeroAmount: fixNum(zeroAmount),
    innerAmount: fixNum(innerAmount),
    ableVATAmount: fixNum(ableVATAmount),
    ableCityTaxAmount: fixNum(ableCityTaxAmount),
  };
};

export const getEbarimtData = async (params: IPutDataArgs) => {
  const { config, doc } = params;
  const type = doc.type || 'B2C_RECEIPT';

  const { customerTin, consumerNo, msg, customerName } = await getCustomerInfo(
    type,
    config,
    doc,
  );
  if (msg) {
    return { status: 'err', msg };
  }

  let reportMonth: string | undefined = undefined;
  if (doc.date && doc.date.getMonth() !== new Date().getMonth()) {
    reportMonth = moment(doc.date).format('YYYY-MM-DD');
  }

  const {
    details,
    detailsFree,
    details0,
    detailsInner,
    ableAmount,
    freeAmount,
    zeroAmount,
    innerAmount,
    ableVATAmount,
    ableCityTaxAmount,
  } = await getArrangeProducts(config, doc);

  let innerData: IEbarimtFull | undefined = undefined;
  let mainData: IEbarimt | undefined = undefined;

  const commonOderInfo = {
    merchantTin: config.merchantTin,
    totalVAT: 0,
    totalCityTax: 0,
    data: {},
  };

  if (details.length || details0.length || detailsFree.length) {
    mainData = {
      number: doc.number,
      contentType: doc.contentType,
      contentId: doc.contentId,

      totalAmount: fixNum(ableAmount + freeAmount + zeroAmount),
      totalVAT: fixNum(ableVATAmount),
      totalCityTax: fixNum(ableCityTaxAmount),
      districtCode: config.districtCode,
      branchNo: config.branchNo,
      merchantTin: config.merchantTin,
      posNo: config.posNo,
      type: doc.type,
      reportMonth,
      data: {},
      customerTin,
      customerName,
      consumerNo,

      receipts: [],
      payments: [],
    };

    if (detailsFree.length) {
      mainData.receipts?.push({
        ...commonOderInfo,
        totalAmount: freeAmount,
        taxType: 'VAT_FREE',
        items: detailsFree,
      });
    }

    if (details0.length) {
      mainData.receipts?.push({
        ...commonOderInfo,
        totalAmount: zeroAmount,
        taxType: 'VAT_ZERO',
        items: details0,
      });
    }

    if (details.length) {
      mainData.receipts?.push({
        ...commonOderInfo,
        totalAmount: ableAmount,
        totalVAT: ableVATAmount,
        totalCityTax: ableCityTaxAmount,
        taxType: 'VAT_ABLE',
        items: details,
      });
    }

    // payments
    let cashAmount: number = fixNum(mainData.totalAmount) ?? 0;
    for (const payment of doc.nonCashAmounts) {
      const paidAmount = fixNum(payment.amount);
      mainData.payments?.push({
        code:
          payment.type?.includes('card') || payment.type?.includes('Card')
            ? 'PAYMENT_CARD'
            : 'CASH',
        exchangeCode: '',
        status: 'PAID',
        paidAmount,
      });

      cashAmount -= paidAmount;
    }

    if (fixNum(cashAmount)) {
      mainData.payments?.push({
        code: 'CASH',
        exchangeCode: '',
        status: 'PAID',
        paidAmount: fixNum(cashAmount),
      });
    }
  }

  if (detailsInner.length) {
    innerData = {
      _id: 'tempBill',
      id: 'tempBIll',
      date: moment(new Date()).format('"YYYY-MM-DD HH:mm:ss'),
      createdAt: new Date(),
      modifiedAt: new Date(),
      status: 'SUCCESS',
      message: '',
      posId: 0,

      number: doc.number,
      contentType: doc.contentType,
      contentId: doc.contentId,

      totalAmount: innerAmount,
      totalVAT: 0,
      totalCityTax: 0,
      districtCode: config.districtCode,
      branchNo: config.branchNo,
      merchantTin: config.merchantTin,
      posNo: config.posNo,
      type: doc.type,
      reportMonth,
      data: {},
      customerTin,
      consumerNo,

      receipts: [
        {
          ...commonOderInfo,
          totalAmount: innerAmount,
          taxType: 'NOT_SEND',
          items: detailsInner,
        },
      ],
      payments: [
        {
          code: 'CASH',
          exchangeCode: '',
          status: 'PAID',
          paidAmount: innerAmount,
        },
      ],
    };
  }

  return { status: 'ok', data: mainData, innerData };
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'configs',
    action: 'getConfig',
    input: { code, defaultValue },
  });
};

export const validCompanyCode = async (config, companyCode) => {
  const resp = await getCompanyInfo({
    checkTaxpayerUrl: config.checkTaxpayerUrl,
    no: companyCode,
  });
  if (resp.status !== 'checked' || !resp.tin) {
    return '';
  }
  return resp.result?.data?.name;
};

export const companyCheckCode = async (params, subdomain) => {
  if (!params.code) {
    return params;
  }

  const config = await getConfig(subdomain, 'EBARIMT', {});

  if (
    !config ||
    !config.checkTaxpayerUrl ||
    !config.checkTaxpayerUrl.includes('http')
  ) {
    return params;
  }

  const companyName = await validCompanyCode(config, params.code);

  if (!companyName) {
    return params;
  }

  if (companyName.includes('**') && params.primaryName) {
    return params;
  }

  params.primaryName = companyName;
  return params;
};

export const validConfigMsg = async (config) => {
  if (!config.url) {
    return 'required url';
  }
  return '';
};

const getCustomerName = (customer) => {
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

const billTypeCustomFieldsData = async (config, deal) => {
  if (
    config.dealBillType?.billType &&
    config.dealBillType?.regNo &&
    deal.customFieldsData?.length
  ) {
    const checkCompanyStrs = [
      'Байгууллага',
      'Company',
      'B2B',
      'B2B_RECEIPT',
      '3',
    ];

    const customDataBillType = deal.customFieldsData.find(
      (cfd) =>
        cfd.field === config.dealBillType.billType &&
        checkCompanyStrs.includes(cfd.value),
    );

    const customDataRegNo = deal.customFieldsData.find(
      (cfd) => cfd.field === config.dealBillType.regNo && cfd.value,
    );

    const customDataComName = deal.customFieldsData.find(
      (cfd) => cfd.field === config.dealBillType.companyName && cfd.value,
    );

    if (customDataBillType && customDataRegNo && customDataComName) {
      const resp = await getCompanyInfo({
        checkTaxpayerUrl: config.checkTaxpayerUrl,
        no: customDataRegNo.value,
      });

      if (resp.status === 'checked' && resp.tin) {
        return {
          type: 'B2B_RECEIPT',
          customerCode: customDataRegNo.value,
          customerName: customDataComName.value,
          customerTin: resp.tin,
        };
      }
    }
  }
};

const billTypeConfomityCompany = async (subdomain, config, deal) => {
  const companyIds = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'conformities',
    action: 'savedConformity',
    input: { mainType: 'deal', mainTypeId: deal._id, relTypes: ['company'] },
    defaultValue: [],
  });

  if (companyIds.length > 0) {
    const companies = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'companies',
      action: 'findActiveCompanies',
      input: {
        selector: { _id: { $in: companyIds } },
        fields: { _id: 1, code: 1, primaryName: 1 },
      },
      defaultValue: [],
    });

    const re =
      /(^[А-ЯЁӨҮ]{2}\d{8}$)|(^\d{7}$)|(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/giu;
    for (const company of companies) {
      if (re.test(company.code)) {
        const checkCompanyRes = await getCompanyInfo({
          checkTaxpayerUrl: config.checkTaxpayerUrl,
          no: company.code,
        });

        if (checkCompanyRes.status === 'checked' && checkCompanyRes.tin) {
          return {
            type: 'B2B_RECEIPT',
            customerCode: company.code,
            customerName: company.primaryName,
            customerTin: checkCompanyRes.tin,
          };
        }
      }
    }
  }
};

const checkBillType = async (subdomain, config, deal) => {
  let type: 'B2C_RECEIPT' | 'B2B_RECEIPT' = 'B2C_RECEIPT';
  let customerCode = '';
  let customerName = '';
  let customerTin = '';

  const checker = await billTypeCustomFieldsData(config, deal);
  if (checker?.type === 'B2B_RECEIPT') {
    type = 'B2B_RECEIPT';
    customerCode = checker.customerCode;
    customerName = checker.customerName;
    customerTin = checker.customerTin;
  }

  if (type === 'B2C_RECEIPT') {
    const checkerC = await billTypeConfomityCompany(subdomain, config, deal);

    if (checkerC?.type === 'B2B_RECEIPT') {
      type = 'B2B_RECEIPT';
      customerCode = checkerC?.customerCode;
      customerName = checkerC?.customerName;
      customerTin = checkerC?.customerTin;
    }
  }

  if (type === 'B2C_RECEIPT') {
    const customerIds = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'conformities',
      action: 'savedConformity',
      input: { mainType: 'deal', mainTypeId: deal._id, relTypes: ['customer'] },
      defaultValue: [],
    });

    if (customerIds.length > 0) {
      const customers = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'findActiveCustomers',
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
      });

      let customer = customers.find((c) => c.code && c.code.match(/^\d{8}$/g));

      if (customer) {
        customerCode = customer.code || '';
        customerName = getCustomerName(customer);
      } else {
        if (customers.length) {
          customer = customers[0];
          customerName = getCustomerName(customer);
        }
      }
    }
  }

  return { type, customerCode, customerName, customerTin };
};

const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'categories',
    action: 'withChilds',
    input: { ids: categoryIds },
    defaultValue: [],
  });

  const catIds: string[] = (childs || []).map((ch) => ch._id) || [];
  return Array.from(new Set(catIds));
};

const getChildTags = async (subdomain: string, tagIds) => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'tags',
    action: 'tagWithChilds',
    input: { query: { _id: { $in: tagIds } }, fields: { _id: 1 } },
    defaultValue: [],
  });

  const foundTagIds: string[] = (childs || []).map((ch) => ch._id) || [];
  return Array.from(new Set(foundTagIds));
};

const checkProductsByRule = async (subdomain, products, rule) => {
  let filterIds: string[] = [];
  const productIds = products.map((p) => p._id);

  if (rule.productCategoryIds?.length) {
    const includeCatIds = await getChildCategories(
      subdomain,
      rule.productCategoryIds,
    );

    const includeProductIdsCat = products
      .filter((p) => includeCatIds.includes(p.categoryId))
      .map((p) => p._id);
    filterIds = filterIds.concat(
      lodash.intersection(includeProductIdsCat, productIds),
    );
  }

  if (rule.tagIds?.length) {
    const includeTagIds = await getChildTags(subdomain, rule.tagIds);

    const includeProductIdsTag = products
      .filter((p) => lodash.intersection(includeTagIds, p.tagIds || []).length)
      .map((p) => p._id);
    filterIds = filterIds.concat(
      lodash.intersection(includeProductIdsTag, productIds),
    );
  }

  if (rule.productIds?.length) {
    filterIds = filterIds.concat(
      lodash.intersection(rule.productIds, productIds),
    );
  }

  if (!filterIds.length) {
    return [];
  }

  // found an special products
  const filterProducts = products.filter((p) => filterIds.includes(p._id));
  if (rule.excludeCatIds?.length) {
    const excludeCatIds = await getChildCategories(
      subdomain,
      rule.excludeCatIds,
    );

    const excProductIdsCat = filterProducts
      .filter((p) => excludeCatIds.includes(p.categoryId))
      .map((p) => p._id);
    filterIds = filterIds.filter((f) => !excProductIdsCat.includes(f));
  }

  if (rule.excludeTagIds?.length) {
    const excludeTagIds = await getChildTags(subdomain, rule.excludeTagIds);

    const excProductIdsTag = filterProducts
      .filter((p) => lodash.intersection(excludeTagIds, p.tagIds || []).length)
      .map((p) => p._id);
    filterIds = filterIds.filter((f) => !excProductIdsTag.includes(f));
  }

  if (rule.excludeProductIds?.length) {
    filterIds = filterIds.filter((f) => !rule.excludeProductIds.includes(f));
  }

  return filterIds;
};

const calcProductsTaxRule = async (
  subdomain: string,
  models: IModels,
  config,
  products,
) => {
  try {
    const vatRules = await models.ProductRules.find({
      _id: { $in: config.reverseVatRules || [] },
    }).lean();
    const ctaxRules = await models.ProductRules.find({
      _id: { $in: config.reverseCtaxRules || [] },
    }).lean();

    const productsById = {};
    for (const product of products) {
      productsById[product._id] = product;
    }

    if (vatRules.length) {
      for (const rule of vatRules) {
        const productIdsByRule = await checkProductsByRule(
          subdomain,
          products,
          rule,
        );

        for (const pId of productIdsByRule) {
          productsById[pId].taxCode = rule.taxCode;
          productsById[pId].taxType = rule.taxType;
        }
      }
    }

    if (ctaxRules.length) {
      for (const rule of ctaxRules) {
        const productIdsByRule = await checkProductsByRule(
          subdomain,
          products,
          rule,
        );

        for (const pId of productIdsByRule) {
          productsById[pId].citytaxCode = rule.taxCode;
          productsById[pId].citytaxPercent = rule.taxPercent;
        }
      }
    }

    return productsById;
  } catch (error) {
    console.error('Error calculating product tax rules:', error);
    throw error;
  }
};

const calcPreTaxPercentage = (paymentTypes, deal) => {
  let itemAmountPrePercent = 0;
  const preTaxPaymentTypes: string[] = (paymentTypes || [])
    .filter(
      (p) =>
        (p.config || '').includes('preTax: true') ||
        (p.config || '').includes('"preTax": true'),
    )
    .map((p) => p.type);

  if (
    preTaxPaymentTypes.length &&
    deal.paymentsData &&
    Object.keys(deal.paymentsData).length
  ) {
    let preSentAmount = 0;
    for (const preTaxPaymentType of preTaxPaymentTypes) {
      const matchOrderPayKeys = Object.keys(deal.paymentsData).filter(
        (pa) => pa === preTaxPaymentType,
      );

      if (matchOrderPayKeys.length) {
        for (const key of matchOrderPayKeys) {
          const matchOrderPay = deal.paymentsData[key];
          preSentAmount += Number(matchOrderPay.amount);
        }
      }
    }
    const values: any[] = Object.values(deal.paymentsData);
    const dealTotalPay = values
      .map((p) => p.amount)
      .reduce((sum, cur) => sum + cur, 0);

    if (preSentAmount && preSentAmount <= dealTotalPay) {
      itemAmountPrePercent = (preSentAmount / dealTotalPay) * 100;
    }
  }

  return { itemAmountPrePercent, preTaxPaymentTypes };
};

const calcGrouped = async (models: IModels, activeProductsData: any[]) => {
  let productsData = activeProductsData.map((pd, ind) => ({ ...pd, ind }));

  const productsIds = productsData.map((item) => item.productId);

  const groups = await models.ProductGroups.find({
    isActive: true,
    mainProductId: { $in: productsIds },
    subProductId: { $in: productsIds },
  })
    .sort({ sortNum: 1 })
    .lean();
  const addProdData: any[] = [];

  for (const group of groups) {
    const { mainProductId, subProductId } = group;
    const mainData = productsData.find(
      (pd) => pd.productId === mainProductId && pd.quantity,
    );
    const subData = productsData.find(
      (pd) => pd.productId === subProductId && pd.quantity,
    );

    if (mainData && subData) {
      const quantity = Math.min(mainData.quantity, subData.quantity);
      const mainRatio = quantity / mainData.quantity;
      const subRatio = quantity / subData.quantity;
      addProdData.push({
        ...mainData,
        _id: `${mainData._id}@${subData._id}`,
        quantity,
        amount: fixNum(mainData.amount * mainRatio + subData.amount * subRatio),
        discount: fixNum(
          (mainData.discount ?? 0) * mainRatio +
            (subData.discount ?? 0) * subRatio,
        ),
        unitPrice: fixNum(mainData.unitPrice + subData.unitPrice),
      });

      productsData = productsData.map((pd) => {
        if (pd._id === mainData._id) {
          const newQuantity = fixNum(pd.quantity - quantity);
          const amountRatio = newQuantity / pd.quantity;
          return {
            ...pd,
            quantity: newQuantity,
            amount: fixNum(mainData.amount * amountRatio),
            discount: fixNum((mainData.discount ?? 0) * amountRatio),
          };
        }
        if (pd._id === subData._id) {
          const newQuantity = fixNum(pd.quantity - quantity);
          const amountRatio = newQuantity / pd.quantity;
          return {
            ...pd,
            quantity: newQuantity,
            amount: fixNum(subData.amount * amountRatio),
            discount: fixNum((subData.discount ?? 0) * amountRatio),
          };
        }
        return pd;
      });
    }
  }

  const newProductsData = [
    ...productsData.filter((pd) => pd.quantity),
    ...addProdData,
  ];

  return newProductsData.sort((a, b) => a.ind - b.ind);
};

export const getPostData = async (
  subdomain,
  models: IModels,
  config,
  deal,
  paymentTypes,
) => {
  const { type, customerCode, customerName, customerTin } = await checkBillType(
    subdomain,
    config,
    deal,
  );

  const activeProductsData = await calcGrouped(
    models,
    deal.productsData.filter((prData) => prData.tickUsed),
  );
  const productsIds = activeProductsData.map((item) => item.productId);

  const firstProducts = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'products',
    action: 'find',
    input: { query: { _id: { $in: productsIds } }, limit: productsIds.length },
    defaultValue: [],
  });

  const productsById = await calcProductsTaxRule(
    subdomain,
    models,
    config,
    firstProducts,
  );
  const { itemAmountPrePercent, preTaxPaymentTypes } = calcPreTaxPercentage(
    paymentTypes,
    deal,
  );

  return {
    contentType: 'deal',
    contentId: deal._id,
    number: deal.number,

    date: new Date(),
    type,

    customerCode,
    customerName,
    customerTin,

    details: activeProductsData
      .filter((prData) => {
        const product = productsById[prData.productId];
        if (!product) {
          return false;
        }
        return true;
      })
      .map((prData) => {
        const product = productsById[prData.productId];
        const tempAmount = prData.amount;
        const minusAmount = (tempAmount / 100) * itemAmountPrePercent;
        const totalAmount = fixNum(tempAmount - minusAmount, 4);

        return {
          recId: prData._id,
          product,
          quantity: prData.quantity,
          totalDiscount: (prData.discount ?? 0) + minusAmount,
          unitPrice: prData.unitPrice,
          totalAmount,
        };
      }),
    nonCashAmounts: Object.keys(deal.paymentsData || {})
      .filter((pay) => !preTaxPaymentTypes.includes(pay))
      .filter((pay) => pay !== 'cash')
      .map((pay) => ({
        amount: deal.paymentsData[pay].amount,
        type: pay,
      })),
  };
};

export const getCompanyInfo = async ({
  checkTaxpayerUrl,
  no,
}: {
  checkTaxpayerUrl: string;
  no: string;
}) => {
  const tinre = /(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/;
  if (tinre.test(no)) {
    const result = await fetch(
      // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
      `${checkTaxpayerUrl}/getInfo?tin=${no}`,
    ).then((r) => r.json());

    return { status: 'checked', result, tin: no };
  }

  const re = /(^[А-ЯЁӨҮ]{2}\d{8}$)|(^\d{7}$)/giu;

  if (!re.test(no)) {
    return { status: 'notValid' };
  }

  const info = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${rd}`
    `${checkTaxpayerUrl}/getTinInfo?regNo=${no}`,
  ).then((r) => r.json());

  if (info.status !== 200) {
    return { status: 'notValid' };
  }

  const tinNo = info.data;

  const result = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
    `${checkTaxpayerUrl}/getInfo?tin=${tinNo}`,
  ).then((r) => r.json());

  return { status: 'checked', result, tin: tinNo };
};

export const returnResponse = async (url, data) => {
  return await fetch(`${url}/rest/receipt`, {
    method: 'DELETE',
    body: JSON.stringify({ ...data }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (r) => {
      if (r.status === 200) {
        return { status: 200 };
      }
      try {
        return r.json();
      } catch (e) {
        return {
          status: 'ERROR',
          message: e.message,
        };
      }
    })
    .catch((err) => {
      return {
        status: 'ERROR',
        message: err.message,
      };
    });
};

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = ndate.getTimezoneOffset() * 1000 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getFullDate = (date: Date) => {
  const ndate = getPureDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth();
  const day = ndate.getDate();

  const today = new Date(year, month, day);
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getTomorrow = (date: Date) => {
  return getFullDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
};
