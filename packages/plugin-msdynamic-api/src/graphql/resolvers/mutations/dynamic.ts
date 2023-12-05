import { sendRequest } from '@erxes/api-utils/src';
import {
  IContext,
  sendContactsMessage,
  sendProductsMessage
} from '../../../messageBroker';
import {
  consumeCategory,
  consumeCustomers,
  consumeInventory,
  getConfig
} from '../../../utils';

const msdynamicMutations = {
  async toCheckProducts(_root, _args, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'DYNAMIC', {});

    const updateProducts: any = [];
    const createProducts: any = [];
    const deleteProducts: any = [];
    let matchedCount = 0;

    if (!config.itemApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { itemApi, username, password } = config;

    try {
      const productsCount = await sendProductsMessage({
        subdomain,
        action: 'count',
        data: { query: { status: { $ne: 'deleted' } } },
        isRPC: true
      });

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: { status: { $ne: 'deleted' } },
          limit: productsCount
        },
        isRPC: true
      });

      const productCodes = (products || []).map(p => p.code) || [];

      const response = await sendRequest({
        url: itemApi,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString('base64')}`
        }
      });

      const resultCodes =
        response.value.map(r => r.No.replace(/\s/g, '')) || [];

      const productByCode = {};
      for (const product of products) {
        productByCode[product.code] = product;

        if (!resultCodes.includes(product.code)) {
          deleteProducts.push(product);
        }
      }

      for (const resProd of response.value) {
        if (productCodes.includes(resProd.No.replace(/\s/g, ''))) {
          const product = productByCode[resProd.No.replace(/\s/g, '')];

          if (
            resProd?.Description === product.name &&
            resProd?.Unit_Price === product.unitPrice &&
            resProd?.Base_Unit_of_Measure === product.uom
          ) {
            matchedCount = matchedCount + 1;
          } else {
            updateProducts.push(resProd);
          }
        } else {
          createProducts.push(resProd);
        }
      }
    } catch (e) {
      console.log(e, 'error');
    }

    return {
      create: {
        count: createProducts.length,
        items: createProducts
      },
      update: {
        count: updateProducts.length,
        items: updateProducts
      },
      delete: {
        count: deleteProducts.length,
        items: deleteProducts
      },
      matched: {
        count: matchedCount
      }
    };
  },

  async toSyncProducts(
    _root,
    { action, products }: { action: string; products: any[] },
    { subdomain }: IContext
  ) {
    try {
      switch (action) {
        case 'CREATE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success'
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toCheckProductCategories(_root, _args, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'DYNAMIC', {});

    const updateCategories: any = [];
    const createCategories: any = [];
    const deleteCategories: any = [];
    let matchedCount = 0;

    if (!config.itemCategoryApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { itemCategoryApi, username, password } = config;

    try {
      const categoriesCount = await sendProductsMessage({
        subdomain,
        action: 'categories.count',
        data: { query: { status: { $ne: 'deleted' } } },
        isRPC: true
      });

      const categories = await sendProductsMessage({
        subdomain,
        action: 'categories.find',
        data: {
          query: { status: { $ne: 'deleted' } },
          limit: categoriesCount
        },
        isRPC: true
      });

      const categoryCodes = (categories || []).map(p => p.code) || [];

      const response = await sendRequest({
        url: itemCategoryApi,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString('base64')}`
        }
      });

      const resultCodes = response.value.map(r => r.Code) || [];

      const categoryByCode = {};
      for (const category of categories) {
        categoryByCode[category.code] = category;

        if (!resultCodes.includes(category.code)) {
          deleteCategories.push(category);
        }
      }

      for (const resProd of response.value) {
        if (categoryCodes.includes(resProd.Code)) {
          const category = categoryByCode[resProd.Code];

          if (resProd?.Code === category.code) {
            matchedCount = matchedCount + 1;
          } else {
            updateCategories.push(resProd);
          }
        } else {
          createCategories.push(resProd);
        }
      }
    } catch (e) {
      console.log(e, 'error');
    }

    return {
      create: {
        count: createCategories.length,
        items: createCategories
      },
      update: {
        count: updateCategories.length,
        items: updateCategories
      },
      delete: {
        count: deleteCategories.length,
        items: deleteCategories
      },
      matched: {
        count: matchedCount
      }
    };
  },

  async toSyncProductCategories(
    _root,
    { action, categories }: { action: string; categories: any[] },
    { subdomain }: IContext
  ) {
    try {
      switch (action) {
        case 'CREATE': {
          for (const category of categories) {
            await consumeCategory(subdomain, category, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const category of categories) {
            await consumeCategory(subdomain, category, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const category of categories) {
            await consumeCategory(subdomain, category, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success'
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toCheckCustomers(_root, _args, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'DYNAMIC', {});

    const createCustomers: any = [];
    const updateCustomers: any = [];
    const deleteCustomers: any = [];
    let matchedCount = 0;

    if (!config.customerApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { customerApi, username, password } = config;

    try {
      const companies = await sendContactsMessage({
        subdomain,
        action: 'companies.findActiveCompanies',
        data: {},
        isRPC: true,
        defaultValue: {}
      });

      const customers = await sendContactsMessage({
        subdomain,
        action: 'customers.findActiveCustomers',
        data: {},
        isRPC: true,
        defaultValue: {}
      });

      const companyCodes = (companies || []).map(c => c.code) || [];
      const customerCodes = (customers || []).map(c => c.code) || [];

      const response = await sendRequest({
        url: customerApi,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString('base64')}`
        }
      });

      const resultCodes =
        response.value.map(r => r.No.replace(/\s/g, '')) || [];

      const companyByCode = {};
      const customerByCode = {};

      for (const company of companies) {
        companyByCode[company.code] = company;

        if (!resultCodes.includes(company.code)) {
          deleteCustomers.push(company);
        }
      }

      for (const customer of customers) {
        customerByCode[customer.code] = customer;

        if (!resultCodes.includes(customer.code)) {
          deleteCustomers.push(customer);
        }
      }

      /* company and customer rquest function*/
      const companyRequest = resCompany => {
        if (companyCodes.includes(resCompany.No.replace(/\s/g, ''))) {
          const company = companyByCode[resCompany.No.replace(/\s/g, '')];

          if (resCompany?.Name === company.primaryName) {
            matchedCount = matchedCount + 1;
          } else {
            updateCustomers.push(resCompany);
          }
        } else {
          createCustomers.push(resCompany);
        }
      };

      const customerRequest = resCompany => {
        if (customerCodes.includes(resCompany.No.replace(/\s/g, ''))) {
          const customer = customerByCode[resCompany.No.replace(/\s/g, '')];

          if (resCompany?.Name === customer.firstName) {
            matchedCount = matchedCount + 1;
          } else {
            updateCustomers.push(resCompany);
          }
        } else {
          createCustomers.push(resCompany);
        }
      };

      /* ---------------------- */

      for (const resCompany of response.value) {
        if (resCompany?.Partner_Type === 'Company') {
          companyRequest(resCompany);
        }

        if (resCompany?.Partner_Type === 'Person') {
          if (resCompany.VAT_Registration_No.length === 7) {
            companyRequest(resCompany);
          } else {
            customerRequest(resCompany);
          }
        }

        if (
          resCompany?.Partner_Type === ' ' &&
          resCompany.VAT_Registration_No
        ) {
          companyRequest(resCompany);
        }

        if (
          resCompany?.Partner_Type === ' ' &&
          !resCompany.VAT_Registration_No
        ) {
          customerRequest(resCompany);
        }
      }
    } catch (e) {
      console.log(e, 'error');
    }

    return {
      create: {
        count: createCustomers.length,
        items: createCustomers
      },
      update: {
        count: updateCustomers.length,
        items: updateCustomers
      },
      delete: {
        count: deleteCustomers.length,
        items: deleteCustomers
      },
      matched: {
        count: matchedCount
      }
    };
  },

  async toSyncCustomers(
    _root,
    { action, customers }: { action: string; customers: any[] },
    { subdomain }: IContext
  ) {
    try {
      switch (action) {
        case 'CREATE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, customer, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, customer, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, customer, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success'
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSendCustomers(
    _root,
    { customers }: { customers: any[] },
    { subdomain }: IContext
  ) {
    try {
      const config = await getConfig(subdomain, 'DYNAMIC', {});

      if (!config.customerApi || !config.username || !config.password) {
        throw new Error('MS Dynamic config not found.');
      }

      const { customerApi, username, password } = config;

      for (const customer of customers) {
        const document: any = {
          Name: 'TEST GERELSUKHw',
          Search_Name: 'TEST GERELSUKHw',
          Phone_No: customer.phone
        };

        const response = await sendRequest({
          url: `${customerApi}?$filter=Phone_No eq '${customer.phone}'`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`
            ).toString('base64')}`
          },
          body: document
        });

        if (response.value.length === 0) {
          const postResponse = await sendRequest({
            url: customerApi,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${Buffer.from(
                `${username}:${password}`
              ).toString('base64')}`
            },
            body: document
          });

          await consumeCustomers(subdomain, postResponse, 'create');
        }
      }

      return {
        status: 'success'
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSendDeals(
    _root,
    { deals }: { deals: any[] },
    { subdomain }: IContext
  ) {
    try {
      const config = await getConfig(subdomain, 'DYNAMIC', {});

      if (!config.salesApi || !config.username || !config.password) {
        throw new Error('MS Dynamic config not found.');
      }

      const { salesApi, username, password } = config;

      for (const deal of deals) {
        const document: any = {
          Document_Type: 'Order',
          No: '002022',
          Local_ID: '',
          Sell_to_Customer_No: '',
          Sell_to_Customer_Name: '',
          Deal_Type_Code: '',
          Sync_Type: ' ',
          Quote_No: '',
          Ordering_Price_Type_Code: '',
          Posting_Description: 'Order 002022',
          Sell_to_Address: '',
          Sell_to_Address_2: '',
          Sell_to_City: '',
          Sell_to_County: '',
          Sell_to_Post_Code: '',
          Sell_to_Country_Region_Code: '',
          Sell_to_Contact_No: '',
          Sell_to_Phone_No: '',
          Sell_to_E_Mail: '',
          Sell_to_Contact: '',
          No_of_Archived_Versions: 0,
          Document_Date: '2023-04-07',
          Posting_Date: '2023-04-07',
          Order_Date: '2023-04-07',
          Due_Date: '0001-01-01',
          Requested_Delivery_Date: '0001-01-01',
          Promised_Delivery_Date: '0001-01-01',
          External_Document_No: '',
          Your_Reference: '',
          Salesperson_Code: '',
          Campaign_No: '',
          Opportunity_No: '',
          Responsibility_Center: '',
          Assigned_User_ID: '',
          Job_Queue_Status: ' ',
          Contract_No: '',
          Status: 'Open',
          WorkDescription: '',
          Phone_No: '',
          Mobile_Phone_No: '',
          Currency_Code: '',
          Prices_Including_VAT: false,
          VAT_Bus_Posting_Group: '',
          Payment_Terms_Code: '',
          Payment_Method_Code: '',
          Posting_No: '',
          Shipping_No: '',
          EU_3_Party_Trade: false,
          Applies_to_Doc_Type: ' ',
          Applies_to_Doc_No: '',
          Applies_to_ID: '',
          SelectedPayments: 'No payment service is made available.',
          Shortcut_Dimension_1_Code: '',
          Shortcut_Dimension_2_Code: '',
          Payment_Discount_Percent: 0,
          Pmt_Discount_Date: '0001-01-01',
          Direct_Debit_Mandate_ID: '',
          Correction: false,
          Invoice_Discount_Calculation: 'None',
          Invoice_Discount_Value: 0,
          Recalculate_Invoice_Disc: false,
          BillType: 'Receipt',
          CustomerNo: '',
          PreviousMonthTrunsaction: false,
          Where_Print_VAT: 'Unposted',
          CheckedVATInfo: false,
          ShippingOptions: 'Default (Sell-to Address)',
          Ship_to_Code: '',
          Ship_to_Name: '',
          Ship_to_Address: '',
          Ship_to_Address_2: '',
          Ship_to_City: '',
          Ship_to_County: '',
          Ship_to_Post_Code: '',
          Ship_to_Country_Region_Code: '',
          Ship_to_Contact: '',
          Shipment_Method_Code: '',
          Shipping_Agent_Code: '',
          Shipping_Agent_Service_Code: '',
          Package_Tracking_No: '',
          BillToOptions: 'Default (Customer)',
          Bill_to_Name: '',
          Bill_to_Address: '',
          Bill_to_Address_2: '',
          Bill_to_City: '',
          Bill_to_County: '',
          Bill_to_Post_Code: '',
          Bill_to_Country_Region_Code: '',
          Bill_to_Contact_No: '',
          Bill_to_Contact: '',
          Location_Code: '',
          Shipment_Date: '2023-04-07',
          Shipping_Advice: 'Partial',
          Outbound_Whse_Handling_Time: '',
          Shipping_Time: '',
          Late_Order_Shipping: false,
          Transaction_Specification: '',
          Transaction_Type: '',
          Transport_Method: '',
          Exit_Point: '',
          Area: '',
          Prepayment_Percent: 0,
          Compress_Prepayment: true,
          Prepmt_Payment_Terms_Code: '',
          Prepayment_Due_Date: '0001-01-01',
          Prepmt_Payment_Discount_Percent: 0,
          Prepmt_Pmt_Discount_Date: '0001-01-01',
          Vehicle_Serial_No: '',
          VIN: '',
          Vehicle_Registration_No: '',
          Make_Code: '',
          Model_Code: '',
          Date_Filter: "''..11/06/23"
        };

        const response = await sendRequest({
          url: salesApi,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`
            ).toString('base64')}`
          },
          body: document
        });
      }

      return {
        status: 'success'
      };
    } catch (e) {
      console.log(e, 'error');
    }
  }
};

export default msdynamicMutations;
