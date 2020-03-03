import * as mongoose from 'mongoose';
import { sendRPCMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';
import { sendRequest } from '../actions/utils';

const getIdsFromConformities = async (conformities: any, type: string) => {
  return conformities.map(item => {
    if (item.mainType === type) {
      return item.mainTypeId;
    }
    return item.relTypeId;
  });
};

const erkhetPostData = async (shape: IShapeDocument, data: any, result: object) => {
  if (!shape.config.url) {
    return result;
  }

  let billType = 1;
  let customerCode = '';

  const { API_MONGO_URL = '' } = process.env;
  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
  };
  const apiMongoClient = await mongoose.createConnection(API_MONGO_URL, options);

  // get savedConformities filter company
  const apiConformities = await apiMongoClient.db.collection('conformities');
  const conformities = await apiConformities
    .find({
      $or: [
        { mainType: 'deal', mainTypeId: data.deal._id, relType: 'company' },
        { mainType: 'company', relType: 'deal', relTypeId: data.deal._id },
      ],
    })
    .toArray();

  if (conformities.length > 0) {
    const companyIds = await getIdsFromConformities(conformities, 'company');
    const apiCompanies = await apiMongoClient.db.collection('companies');
    const companies = await apiCompanies.find({ _id: { $in: companyIds } }).toArray();

    for (const company of companies) {
      if (company.code && company.code.length === 7) {
        const checkCompanyRes = await sendRequest({
          url: shape.config.checkCompanyUrl,
          method: 'GET',
          params: { ttd: company.code },
        });
        if (checkCompanyRes.found) {
          billType = 3;
          customerCode = company.code;
          continue;
        }
      }
    }
  }

  // if hasnt company then exists set customerCode
  if (billType === 1) {
    // get savedConformities filter customer
    const apiCusConformities = await apiMongoClient.db.collection('conformities');
    const cusConformities = await apiCusConformities
      .find({
        $or: [
          { mainType: 'deal', mainTypeId: data.deal._id, relType: 'customer' },
          { mainType: 'customer', relType: 'deal', relTypeId: data.deal._id },
        ],
      })
      .toArray();

    if (cusConformities.length > 0) {
      const customerIds = await getIdsFromConformities(cusConformities, 'customer');
      const apiCustomers = await apiMongoClient.db.collection('customers');
      const customers = await apiCustomers.find({ _id: { $in: customerIds } }).toArray();
      customerCode = customers.length > 0 ? customers[0].code : '' || '';
    }
  }

  const apiProducts = apiMongoClient.db.collection('products');
  const productsIds = data.deal.productsData.map(item => item.productId);
  const products = await apiProducts.find({ _id: { $in: productsIds } }).toArray();

  const productCodeById = {};
  for (const product of products) {
    productCodeById[product._id] = product.code;
  }

  const details = [];
  for (const productData of data.deal.productsData) {
    details.push({
      count: productData.quantity,
      amount: productData.amount,
      discount: productData.discount,
      inventoryCode: productCodeById[productData.productId] || '',
    });
  }

  const payments = {};
  const configure = {
    prepay: 'preAmount',
    cash: 'cashAmount',
    bank: 'mobileAmount',
    pos: 'cartAmount',
    wallet: 'debtAmount',
    barter: 'debtBarterAmount',
    after: 'debtAmount',
    other: 'debtAmount',
  };

  for (const paymentKind of Object.keys(data.deal.paymentsData || [])) {
    const payment = data.deal.paymentsData[paymentKind];
    payments[configure[paymentKind]] = payment.amount;
  }

  const orderInfos = [
    {
      date: new Date().toISOString().slice(0, 10),
      orderId: data.deal._id,
      hasVat: shape.config.hasVat || false,
      hasCitytax: shape.config.hasCitytax || false,
      billType,
      customerCode,
      details,
      ...payments,
    },
  ];

  const postData = {
    userEmail: shape.config.userEmail,
    token: shape.config.apiToken,
    apiKey: shape.config.apiKey,
    apiSecret: shape.config.apiSecret,
    orderInfos: JSON.stringify(orderInfos),
  };

  const response = await sendRPCMessage({
    action: 'get-response-send-order-info',
    data: postData,
  });

  return response;
};

export default erkhetPostData;
