import {
  configCodes,
  getConfigs,
  qpayToken,
  makeInvoiceNo,
  createInvoice,
  setQpayConfig,
  delQpayConfigs,
  getDataFromConfigById,
  deleteInvoice,
  deleteQpayPayment
} from '../../utils';

import {
  hmac256,
  socialPayInvoicePhone,
  socialPayInvoiceQR,
  socialPayInvoiceCancel,
  socialPayPaymentCancel,
  configCodes as configCodesSP
} from '../../utilsGolomtSP'

const Mutations = [
  /**
   * cancel payment socialPay invoice    
   */
   {
    name: 'cancelPaymentSPInvoice',
    handler: async (_root, params, { models }) => {
      
      const configs = models.Configs;
      const invoiceNo = params.invoiceNo;
      const terminal = await getConfigs(configs,configCodesSP['terminal']);
      const keyIV = await getConfigs(configs,configCodesSP['key']);
      const invoice = await models.SocialPayInvoice.getSocialPayInvoice(models,invoiceNo);
      const amount = invoice.amount;
      const checksum = await hmac256(keyIV,amount+invoiceNo+terminal);

      const requestBody = {
        amount,
        checksum,
        invoice: invoiceNo,        
        terminal
      }              
      const invoiceQrData = await socialPayPaymentCancel(requestBody, configs);
      const response = invoiceQrData.header && invoiceQrData.header.code ? invoiceQrData.header.code : 0;
      
      if(response === 200) {
        await models.SocialPayInvoice.socialPayInvoiceStatusUpdate(models,invoice,"canceled payment");
      }            
      
      return invoiceQrData;
    }  
  },
  /**
   * cancel socialPay invoice    
   */
   {
    name: 'cancelSPInvoice',
    handler: async (_root, params, { models }) => {
      
      const configs = models.Configs;
      const invoiceNo = params.invoiceNo; console.log(invoiceNo);
      const terminal = await getConfigs(configs,configCodesSP['terminal']);
      const keyIV = await getConfigs(configs,configCodesSP['key']);
      const invoice = await models.SocialPayInvoice.getSocialPayInvoice(models,invoiceNo);
      const amount = invoice.amount; console.log(amount);
      const checksum = await hmac256(keyIV,terminal+invoiceNo+amount);  console.log(checksum);

      const requestBody = {
        amount,
        checksum,
        invoice: invoiceNo,        
        terminal
      }              
      const invoiceQrData = await socialPayInvoiceCancel(requestBody, configs);
      const response = invoiceQrData.header && invoiceQrData.header.code ? invoiceQrData.header.code : 0;
      
      if(response === 200) {
        await models.SocialPayInvoice.socialPayInvoiceStatusUpdate(models,invoice,"canceled");
      }            
      
      return invoiceQrData;
    }  
  },
  /**
   * create socialPay invoice with QR
   */
   {
    name: 'createSPInvoiceQr',
    handler: async (_root, params, { models }) => {

      const { amount } = params;
      const configs = models.Configs;
      const invoiceNo = params.invoiceNoAuto ? await makeInvoiceNo(32) : params.invoice;
      const terminal = await getConfigs(configs,configCodesSP['terminal']);
      const keyIV = await getConfigs(configs,configCodesSP['key']);
      const checksum = await hmac256(keyIV,terminal+invoiceNo+amount);
      const doc = { amount, invoiceNo };
      const invoiceLog = await models.SocialPayInvoice.socialPayInvoiceCreate(models,doc);

      const requestBody = {
        amount,
        checksum,
        invoice: invoiceNo,        
        terminal
      }              
      const invoiceQrData = await socialPayInvoiceQR(requestBody, configs);  
      const qrText = invoiceQrData.body && invoiceQrData.body.response && invoiceQrData.body.response.desc ? invoiceQrData.body.response.desc : "";

      if(qrText) {
        await models.SocialPayInvoice.socialPayInvoiceUpdate(models,invoiceLog,qrText);
      }      

      return invoiceQrData;
    }  
  },
  /**
   * create socialPay invoice with phone 
   */
  {
    name: 'createSPInvoicePhone',
    handler: async (_root, params, { models }) => {

      const { amount , phone } = params
      const configs = models.Configs;
      const invoiceNo = params.invoiceNoAuto ? await makeInvoiceNo(32) : params.invoice;      
      const terminal = await getConfigs(configs,configCodesSP['terminal']);
      const keyIV = await getConfigs(configs,configCodesSP['key']);
      const checksum = await hmac256(keyIV,terminal+invoiceNo+amount+phone);      
      const doc = { amount, invoiceNo, phone };
      await models.SocialPayInvoice.socialPayInvoiceCreate(models,doc);

      const requestBody = {
        amount,
        checksum,
        invoice: invoiceNo,
        phone,
        terminal
      }
              
      return await socialPayInvoicePhone(requestBody, configs);
    }  
  },

    /**
   * START QPAY MUTATIONS
   * * START QPAY MUTATIONS
   * * START QPAY MUTATIONS
   * * START QPAY MUTATIONS
   * * START QPAY MUTATIONS
   */

  /**
   * address set and del for qpay invoice
   */
  {
    name: 'setQpayAddress',
    handler: async (_root, doc, { models }) => {
      const code = "qpayAddressCode";
      return await setQpayConfig(code,models,doc);
    }
  },
  {
    name: 'delQpayAddress',
    handler: async (_root, doc, { models }) => {
      const code = "qpayAddressCode";
      return await delQpayConfigs(code,models,doc);
    }
  },
  /**
   * sender branch data set and del for qpay invoice
   */
  {
    name: 'setQpaySenderBranchData',
    handler: async (_root, doc, { models }) => {
      const code = "qpaySenderBranchDataCode";
      return await setQpayConfig(code,models,doc);
    }
  },
  {
    name: 'delQpaySenderBranchData',
    handler: async (_root, doc, { models }) => {
      const code = "qpaySenderBranchDataCode";
      return await delQpayConfigs(code,models,doc);
    }
  },
  /**
   * sender staff data set and del for qpay invoice
   */
   {
    name: 'setQpaySenderStaffData',
    handler: async (_root, doc, { models }) => {
      const code = "qpaySenderStaffDataCode";
      return await setQpayConfig(code,models,doc);
    }
  },
  {
    name: 'delQpaySenderStaffData',
    handler: async (_root, doc, { models }) => {
      const code = "qpaySenderStaffDataCode";
      return await delQpayConfigs(code,models,doc);
    }
  },
  /**
   * invoice receiver data set and del for qpay invoice
   */
   {
    name: 'setQpayInvoiceReceiverData',
    handler: async (_root, doc, { models }) => {
      const code = "qpayInvoiceReceiverDataCode";
      return await setQpayConfig(code,models,doc);
    }
  },
  {
    name: 'delQpayInvoiceReceiverData',
    handler: async (_root, doc, { models }) => {
      const code = "qpayInvoiceReceiverDataCode";
      return await delQpayConfigs(code,models,doc);
    }
  },
  /**
   * discounts set and del for qpay invoice
   */
   {
    name: 'setQpayDiscounts',
    handler: async (_root, doc, { models }) => {
      const code = "qpayDiscountsCode";
      return await setQpayConfig(code,models,doc);
    }
  },
  {
    name: 'delQpayDiscounts',
    handler: async (_root, doc, { models }) => {
      const code = "qpayDiscountsCode";
      return await delQpayConfigs(code,models,doc);
    }
  },
    /**
   * surcharges set and del for qpay invoice
   */
     {
      name: 'setQpaySurcharges',
      handler: async (_root, doc, { models }) => {
        const code = "qpaySurchargesCode";
        return await setQpayConfig(code,models,doc);
      }
    },
    {
      name: 'delQpaySurcharges',
      handler: async (_root, doc, { models }) => {
        const code = "qpaySurchargesCode";
        return await delQpayConfigs(code,models,doc);
      }
    },
    /**
   * taxes set and del for qpay invoice
   */
     {
      name: 'setQpayTaxes',
      handler: async (_root, doc, { models }) => {
        const code = "qpayTaxesCode";
        return await setQpayConfig(code,models,doc);
      }
    },
    {
      name: 'delQpayTaxes',
      handler: async (_root, doc, { models }) => {
        const code = "qpayTaxesCode";
        return await delQpayConfigs(code,models,doc);
      }
    },    
  /**
   * lines set and del for qpay invoice
   */
     {
      name: 'setQpayLines',
      handler: async (_root, doc, { models }) => {
        const code = "qpayLinesCode";
        return await setQpayConfig(code,models,doc);
      }
    },
    {
      name: 'delQpayLines',
      handler: async (_root, doc, { models }) => {
        const code = "qpayLinesCode";
        return await delQpayConfigs(code,models,doc);
      }
    },
    /**
   * transaction set and del for qpay invoice
   */
     {
      name: 'setQpayTransaction',
      handler: async (_root, doc, { models }) => {
        const code = "qpayTransactionCode";
        return await setQpayConfig(code,models,doc);
      }
    },
    {
      name: 'delQpayTransaction',
      handler: async (_root, doc, { models }) => {
        const code = "qpayTransactionCode";
        return await delQpayConfigs(code,models,doc);
      }
    },
    /**
     * create invoice 
     */    
     { 
      name: 'createQpayInvoice',
      handler: async (_root, doc, { models }) => {
        const configs = models.Configs;
        const invoice_code = await getConfigs(configs,configCodes['invoiceCode']);      
        const token = await qpayToken(configs);        
        let callback = await getConfigs(configs,configCodes['callback']);        
        const  sender_invoice_no = !doc.sender_invoice_no_auto ? doc.sender_invoice_no : await makeInvoiceNo(16);
        callback = `${callback}?payment_id=${sender_invoice_no}`
        const codeMap = {
          sender_branch_dataId:	"qpaySenderBranchDataCode",
          sender_staff_dataId: "qpaySenderStaffDataCode",
          invoice_receiver_dataId: "qpayInvoiceReceiverDataCode",
          lines: "qpayLinesCode",
          transactions: "qpayTransactionCode"
        };        
          
      const sender_branch_code = doc.sender_branch_code || "";
      const sender_branch_dataId = doc.sender_branch_dataId ? (await getDataFromConfigById(codeMap['sender_branch_dataId'], [doc.sender_branch_dataId], configs))[0].data : "";
      const sender_staff_code = doc.sender_staff_code || "";
      const sender_staff_dataId = doc.sender_staff_dataId ? (await getDataFromConfigById(codeMap['sender_staff_dataId'], [doc.sender_branch_dataId], configs))[0].data : "";
      const sender_terminal_code = doc.sender_terminal_code || "";
      const sender_terminal_data = doc.sender_terminal_data ? { name: doc.sender_terminal_data } : "";
      const invoice_receiver_code = doc.invoice_receiver_code || "";
      const invoice_receiver_dataId = doc.invoice_receiver_dataId ? (await getDataFromConfigById(codeMap['invoice_receiver_dataId'], [doc.sender_branch_dataId], configs))[0].data : "";
      const invoice_description = doc.invoice_description || "";
      const invoice_due_date = doc.invoice_due_date || "";
      const enable_expiry = doc.enable_expiry || "";
      const expiry_date = doc.expiry_date || "";
      const calculate_vat = doc.calculate_vat || "";
      const tax_customer_code = doc.tax_customer_code || "";
      const line_tax_code = doc.line_tax_code || "";
      const allow_partial = doc.allow_partial || "";
      const minimum_amount = doc.minimum_amount || "";
      const allow_exceed = doc.allow_exceed || "";
      const maximum_amount = doc.maximum_amount || "";
      const amount = doc.amount || "";      
      const note = doc.note || "";
      let lines = doc.lines ? await getDataFromConfigById(codeMap['lines'], doc.lines, configs) : "";
      lines = lines ? lines.map(e => e.data) : "";
      let transactions = doc.transactions ? await getDataFromConfigById(codeMap['transactions'], doc.transactions, configs) : "";
      transactions = transactions ? transactions.map(e => e.data) : "";                
  
      const invoiceDoc = {
        senderInvoiceNo: sender_invoice_no,
        amount
      }
  
      const invoice = await models.QpayInvoice.qpayInvoiceCreate(models,invoiceDoc);
      let varData;
      const fillVarData = (obj, key, data) => {
        if(data) {  
          return {
            ...obj,
            ...{ [key]: data}
          } 
        }
        else 
        {
          return obj
        }
      };
 
      varData = fillVarData({},"invoice_code",invoice_code);
      varData = fillVarData(varData,"sender_invoice_no",sender_invoice_no);
      varData = fillVarData(varData,"callback_url",callback);
      varData = fillVarData(varData,"sender_branch_code",sender_branch_code);
      varData = fillVarData(varData,"sender_branch_dataId",sender_branch_dataId);
      varData = fillVarData(varData,"sender_staff_code",sender_staff_code);
      varData = fillVarData(varData,"sender_staff_dataId",sender_staff_dataId);
      varData = fillVarData(varData,"sender_terminal_code",sender_terminal_code);
      varData = fillVarData(varData,"sender_terminal_data",sender_terminal_data);
      varData = fillVarData(varData,"invoice_receiver_code",invoice_receiver_code);
      varData = fillVarData(varData,"invoice_receiver_dataId",invoice_receiver_dataId);
      varData = fillVarData(varData,"invoice_description",invoice_description);
      varData = fillVarData(varData,"invoice_due_date",invoice_due_date);
      varData = fillVarData(varData,"enable_expiry",enable_expiry);
      varData = fillVarData(varData,"expiry_date",expiry_date);
      varData = fillVarData(varData,"calculate_vat",calculate_vat);
      varData = fillVarData(varData,"tax_customer_code",tax_customer_code);
      varData = fillVarData(varData,"line_tax_code",line_tax_code);
      varData = fillVarData(varData,"allow_partial",allow_partial);
      varData = fillVarData(varData,"minimum_amount",minimum_amount);
      varData = fillVarData(varData,"allow_exceed",allow_exceed);
      varData = fillVarData(varData,"maximum_amount",maximum_amount);
      varData = fillVarData(varData,"amount",amount);
      varData = fillVarData(varData,"note",note);
      varData = fillVarData(varData,"lines",lines);
      varData = fillVarData(varData,"transactions",transactions);

      console.log(varData);
  
        const invoiceData = await createInvoice(varData, token, configs);  
        await models.QpayInvoice.qpayInvoiceUpdate(models,invoice,invoiceData);
  
        return invoiceData;        
      }
    },
    /**
     * create simple invoice 
     */
  {
    name: 'createQpaySimpleInvoice',
    handler: async (_root, doc, { models }) => {      

      const configs = models.Configs;
      const invoice_code = await getConfigs(configs,configCodes['invoiceCode']);      
      const token = await qpayToken(configs);      
      const callback = await getConfigs(configs,configCodes['callback']);

      const { sender_invoice_no_auto, invoice_receiver_code, invoice_description, amount } = doc
      const  sender_invoice_no = !sender_invoice_no_auto ? doc.sender_invoice_no : await makeInvoiceNo(16);

      const invoiceDoc = {
        senderInvoiceNo: sender_invoice_no,
        amount
      }
      
      const invoice = await models.QpayInvoice.qpayInvoiceCreate(models,invoiceDoc);
      
      const varData = {
        invoice_code,
        sender_invoice_no,
        invoice_receiver_code,
        invoice_description,
        amount,
        callback_url: `${callback}?payment_id=${sender_invoice_no}`
      }            

      const invoiceData = await createInvoice(varData, token, configs);

      await models.QpayInvoice.qpayInvoiceUpdate(models,invoice,invoiceData);

      return invoiceData;
    }
  },
  {
    name: 'cancelQpayInvoice',
    handler: async (_root, params, { models }) => {
      const configs = models.Configs;
      const token = await qpayToken(configs);      

      return await deleteInvoice(params.invoiceId,token, configs);
    }  
  },
  {
    name: 'deleteQpayPayment',
    handler: async (_root, params, { models }) => {
      const configs = models.Configs;
      const token = await qpayToken(configs);      

      return await deleteQpayPayment(params.paymentId,params.description || "",token, configs);
    }  
  }
];

export default Mutations;
