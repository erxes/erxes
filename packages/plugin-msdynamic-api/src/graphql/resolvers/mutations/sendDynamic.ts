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
          Sell_to_Phone_No: '11336666, 98071213,99096544',
          Sell_to_E_Mail: 'Account@gkirishpub.mn',
          External_Document_No: 'nemelt medeelel',
          Responsibility_Center: 'BEV-DIST',
          Sync_Type: 'ECOMMERCE',
          Mobile_Phone_No: '',
          VAT_Bus_Posting_Group: 'DOMESTIC',
          Payment_Terms_Code: '28TH',
          Payment_Method_Code: 'CASH',
          Posting_No: '',
          Shipping_No: '',
          BillType: 'Receipt',
          Location_Code: 'BEV-01',
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
