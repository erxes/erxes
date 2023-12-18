import { sendRequest } from '@erxes/api-utils/src';
import { IContext } from '../../../messageBroker';
import { consumeCustomers, getConfig } from '../../../utils';

const msdynamicSendMutations = {
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

export default msdynamicSendMutations;
