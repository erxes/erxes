import fetch from 'node-fetch';
import { IContext } from '../../../messageBroker';
import { getConfig } from '../../../utils';

const msdynamicSendMutations = {
  async toSendDeals(
    _root,
    { brandId, deals }: { brandId: string; deals: any[] },
    { subdomain, models }: IContext,
  ) {
    let syncLog;

    try {
      const configs = await getConfig(subdomain, 'DYNAMIC', {});
      const config = configs[brandId || 'noBrand'];

      if (!config.salesApi || !config.username || !config.password) {
        throw new Error('MS Dynamic config not found.');
      }

      const { salesApi, username, password } = config;

      for (const deal of deals) {
        const syncLogDoc = {
          type: '',
          contentType: 'pos:order',
          contentId: 'pos._id',
          createdAt: new Date(),
          consumeData: deal,
          consumeStr: JSON.stringify(deal),
        };

        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        const document: any = {
          Sell_to_Customer_No: 'BEV-00499',
          Sell_to_Customer_Name: 'Irish pub',
          Sell_to_Address: 'Sukhbaatsar duuger',
          Sell_to_Address_2: '1r khoroo',
          Sell_to_City: 'Ulaanbaatar',
          Sell_to_Post_Code: '14000',
          Sell_to_Country_Region_Code: 'MN',
          Sell_to_Contact_No: '',
          Sell_to_Phone_No: '11336666, 98071213,99096544',
          Sell_to_E_Mail: 'Account@gkirishpub.mn',
          Deal_Type_Code: '',
          Document_Date: '2021-07-06',
          Posting_Date: '2021-07-06',
          Order_Date: '2021-07-06',
          Due_Date: '2021-07-06',
          Requested_Delivery_Date: '0001-01-01',
          Promised_Delivery_Date: '0001-01-01',
          External_Document_No: '',
          Responsibility_Center: 'BEV-DIST',
          Sync_Type: ' ',
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
              Description_2: 'TESTEDBYGG',
              Quantity: 12,
              Unit_Price: 159000,
              Line_Discount_Amount: 0,
              Unit_Cost_LCY: 100713.96542,
              Location_Code: 'BEV-01',
              Unit_of_Measure_Code: 'PCS',
              Unit_of_Measure: 'Piece',
            },
          ],
        };

        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          {
            $set: {
              sendData: document,
              sendStr: JSON.stringify(document),
            },
          },
        );

        const response = await fetch(
          `${salesApi}?$expand=Sales_Order_APISalesLines`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${Buffer.from(
                `${username}:${password}`,
              ).toString('base64')}`,
            },
            body: JSON.stringify(document),
          },
        ).then((res) => res.json());

        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          {
            $set: {
              responseData: response,
              responseStr: JSON.stringify(response),
            },
          },
        );
      }

      return {
        status: 'success',
      };
    } catch (e) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } },
      );
      console.log(e, 'error');
    }
  },
};

export default msdynamicSendMutations;
