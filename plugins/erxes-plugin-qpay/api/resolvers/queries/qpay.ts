// import { paginate } from 'erxes-api-utils';
import {  
  getQpayInvoice,  
  qpayToken,
  checkQpayPayment,
  listQpayPayment,
  getQpayNuat,
  getQpayConfigs,
  getConfigs
} from '../../utils';

import {
  hmac256,
  socialPayInvoiceCheck,
  configCodes as configCodesSP
} from '../../utilsGolomtSP'

export const paginate = (
  collection,
  params: {
    ids?: string[];
    page?: number;
    perPage?: number;
    excludeIds?: boolean;
  }
) => {
  const { page = 0, perPage = 0, ids, excludeIds } = params || { ids: null };

  const _page = Number(page || "1");
  const _limit = Number(perPage || "20");

  if (ids && ids.length > 0) {
    return excludeIds ? collection.limit(_limit) : collection;
  }

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

const Queries = [
  /**
   * check socialPay invoice    
   */
   {
    name: 'checkSPInvoice',
    handler: async (_root, params, { models }) => {
      
      const configs = models.Configs;
      const invoiceNo = params.invoiceNo;
      const terminal = await getConfigs(configs,configCodesSP['terminal']);
      const keyIV = await getConfigs(configs,configCodesSP['key']);
      const invoice = await models.SocialPayInvoice.getSocialPayInvoice(models,invoiceNo);
      const amount = invoice.amount;
      const checksum = await hmac256(keyIV,terminal+invoiceNo+amount);

      const requestBody = {
        amount,
        checksum,
        invoice: invoiceNo,        
        terminal
      };      
            
      return await socialPayInvoiceCheck(requestBody, configs);
    }  
  },

  /**
   * get socialPay invoice logs
   */
  {
    name: 'socialPayInvoices',
    handler: async (_root, params, { models }) => {                  
      
      return paginate(models.SocialPayInvoice.find().sort({createdAt: -1}), params);
      
    }
  },

  /**
   * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   */
  {
    name: 'getQpayAddresses',
    handler: async (_root, params, { models }) => {
      const code = "qpayAddressCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQpaySenderBranchDatas',
    handler: async (_root, params, { models }) => {
      const code = "qpaySenderBranchDataCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQpaySenderStaffDatas',
    handler: async (_root, params, { models }) => {
      const code = "qpaySenderStaffDataCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQpayInvoiceReceiverDatas',
    handler: async (_root, params, { models }) => {
      const code = "qpayInvoiceReceiverDataCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQPayDiscounts',
    handler: async (_root, params, { models }) => {
      const code = "qpayDiscountsCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQpaySurcharges',
    handler: async (_root, params, { models }) => {
      const code = "qpaySurchargesCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQpayTaxes',
    handler: async (_root, params, { models }) => {      
      const code = "qpayTaxesCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQpayLines',
    handler: async (_root, params, { models }) => {
      const code = "qpayLinesCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQpayTransaction',
    handler: async (_root, params, { models }) => {
      const code = "qpayTransactionCode";
      return getQpayConfigs(code,models,params);
    }
  },
  {
    name: 'getQpayInvoiceDetails',
    handler: async (_root, params, { models }) => {
      const configs = models.Configs;
      const token = await qpayToken(configs);      

      const invoice = await models.QpayInvoice.findOne({qpayInvoiceId: params.invoiceId});
      
      const detail = await getQpayInvoice(params.invoiceId,token, configs);

      if( invoice && !invoice.qpayPaymentId && detail.invoice_status === "CLOSED") {                
        const payments = detail.payments;        
        payments.map( async e => {
          const paymentId = e.payment_id;

          await models.QpayInvoice.updateOne({qpayInvoiceId: params.invoiceId} , {$set : {paymentDate: new Date() , qpayPaymentId: paymentId, status: 'PAID'}});
        });
      }      

      return detail;
    }  
  },
  {
    name: 'qpayInvoices',
    handler: async (_root, params, { models }) => {
      return paginate(models.QpayInvoice.find().sort({createdAt: -1}), params);
    }  
  },
  {
    name: 'checkQpayPayments',
    handler: async (_root, params, { models }) => {
      const configs = models.Configs;
      const token = await qpayToken(configs);      
      
      const page = params.page ? params.page : 1;
      const limit = params.limit ? params.limit : 100;

      const varData = { object_type: params.objectType,
        object_id: params.objectId,
        offset: {
          page_number: page,
          page_limit: limit
        }
      };

      return await checkQpayPayment(varData,token, configs);
    }  
  },
  {
    name: 'listQpayPayments',
    handler: async (_root, params, { models }) => {
      const configs = models.Configs;
      const token = await qpayToken(configs);      
      const { page, limit, objectType, objectId, merchant_branch_code, merchant_terminal_code, merchant_staff_code} = params
      
      const pageData = page ? page : 1;
      const limitData = limit ? limit : 100;      

      let varData = { object_type: objectType,
        object_id: objectId,
        offset: {
          page_number: pageData,
          page_limit: limitData
        }
      };         
      varData = merchant_branch_code 
      ? { ...varData , ...{merchant_branch_code} } 
      : merchant_terminal_code ? { ...varData , ...{merchant_terminal_code} } 
      : merchant_staff_code ? { ...varData , ...{merchant_staff_code} } 
      : varData;
      

      return await listQpayPayment(varData,token, configs);
    }  
  },
  {
    name: 'getQpayNuat',
    handler: async (_root, params, { models }) => {
      const configs = models.Configs;
      const token = await qpayToken(configs);      
      const varData = {
        payment_id: params.paymentId,
        ebarimt_receiver_type: params.receiverType
      };                

      return await getQpayNuat(varData, token, configs);
    }  
  }
];

export default Queries;
