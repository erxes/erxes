import { sendRequest } from '@erxes/api-utils/src';
import { IContext } from '../../../messageBroker';
import { consumeCustomers, getConfig } from '../../../utils';

const msdynamicSendMutations = {
  async toSendDeals(
    _root,
    { brandId, deals }: { brandId: string; deals: any[] },
    { subdomain }: IContext
  ) {
    try {
      const configs = await getConfig(subdomain, 'DYNAMIC', {});
      const config = configs[brandId || 'noBrand'];

      if (!config.salesApi || !config.username || !config.password) {
        throw new Error('MS Dynamic config not found.');
      }

      const { salesApi, username, password } = config;

      for (const deal of deals) {
        const document: any = {
          Document_Type: 'Order',
          No: 'MO-108459',

          Sell_to_Customer_No: 'BEV-00499',
          Sell_to_Customer_Name: 'Irish pub',
          Deal_Type_Code: '',
          Sync_Type: ' ',
          Quote_No: '',
          Ordering_Price_Type_Code: '',
          Posting_Description: 'Order MO-108459',
          Sell_to_Address: 'Sukhbaatsar duuger',
          Sell_to_Address_2: '1r khoroo',
          Sell_to_City: 'Ulaanbaatar',
          Sell_to_Post_Code: '14000',
          Sell_to_Country_Region_Code: 'MN',
          Sell_to_Contact_No: '',
          Sell_to_Phone_No: '11336666, 98071213,99096544',
          Sell_to_E_Mail: 'Account@gkirishpub.mn',
          Sell_to_Contact: 'S.Batmunkh88114487',
          Document_Date: '2021-07-06',
          Posting_Date: '2021-07-06',
          Order_Date: '2021-07-06',
          Due_Date: '2021-07-06',
          Requested_Delivery_Date: '0001-01-01',
          Promised_Delivery_Date: '0001-01-01',
          External_Document_No: '',
          Responsibility_Center: 'BEV-DIST',
          Status: 'Released',
          Mobile_Phone_No: '',
          Prices_Including_VAT: true,
          VAT_Bus_Posting_Group: 'DOMESTIC',
          Payment_Terms_Code: '28TH',
          Payment_Method_Code: 'BANK',
          Posting_No: '',
          Shipping_No: '',
          BillType: 'Invoice',
          Where_Print_VAT: 'Unposted',
          CheckedVATInfo: true,
          Sales_Order_APISalesLines: [
            {
              Line_No: 10000,
              Type: 'Item',
              No: '11-1-1101',
              Description: 'Hennessy VSOP 70cl',
              Description_2: '700��',
              Quantity: 12,
              Unit_Price: 159000,
              Unit_Cost_LCY: 100713.96542,
              Location_Code: 'BEV-01',
              Unit_of_Measure_Code: 'PCS',
              Unit_of_Measure: 'Piece'
              //       12. Business Unit Code- From Item card
              // Brand Code- From Item card
            }
          ]
          // Customer Price Group- From Customer card
          //  Customer Disc.Group- From Customer card
          //    NAME mn
          // Creation date
          //   Business Unit Code
          // Bill Type
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
