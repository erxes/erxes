import fetch from 'node-fetch';
import { IContext, generateModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Get DYNAMIC config from mnconfigs module
 */
const getDynamicConfig = async (models: any, brandId?: string) => {
  const configs = await models.Configs.getConfigs('DYNAMIC');

  if (!configs?.length) {
    throw new Error('MS Dynamic config not found.');
  }

  const map = configs.reduce((acc: any, conf: any) => {
    acc[conf.subId || 'noBrand'] = conf.value;
    return acc;
  }, {});

  const key = brandId || 'noBrand';
  let config = map[key];

  if (!config && map['noBrand'] && typeof map['noBrand'] === 'object') {
    config = map['noBrand'][key];
  }

  if (!config) {
    throw new Error('MS Dynamic config not found.');
  }

  return config;
};

/**
 * ============================
 * MS Dynamic Check Mutations
 * ============================
 */
export const msdynamicCheckMutations = {
  async toCheckMsdProducts(
    _root,
    { brandId }: { brandId: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdCheck');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    if (!config.itemApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not valid.');
    }

    const { itemApi, username, password } = config;

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: { status: { $ne: 'deleted' } } },
      defaultValue: [],
    });

    const productCodes = products.map((p: any) => p.code);

    const response = await fetch(
      `${itemApi}?$filter=Item_Category_Code ne '' and Blocked ne true and Allow_Ecommerce eq true`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      },
    ).then((r) => r.json());

    const resultCodes = response?.value?.map((r: any) => r.No) || [];

    return {
      create: resultCodes.filter((c: string) => !productCodes.includes(c))
        .length,
      delete: productCodes.filter((c: string) => !resultCodes.includes(c))
        .length,
      matched: resultCodes.filter((c: string) => productCodes.includes(c))
        .length,
    };
  },

  async toCheckMsdSynced(
    _root: unknown,
    { ids = [] }: { ids?: string[] },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdCheck');

    const models = await generateModels(subdomain);

    const syncLogs = await models.SyncLogsMSD.find({
      contentType: 'pos:order',
      contentId: { $in: ids },
      error: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .lean();

    const syncMap: Record<
      string,
      {
        isSynced: boolean;
        syncedDate?: string;
        syncedBillNumber?: string;
        syncedCustomer?: string;
      }
    > = {};
    for (const log of syncLogs) {
      const existing = syncMap[log.contentId];
      if (!existing && log.responseData?.No) {
        syncMap[log.contentId] = {
          isSynced: true,
          syncedDate: log.responseData.Order_Date,
          syncedBillNumber: log.responseData.No,
          syncedCustomer: log.responseData.Sell_to_Customer_No,
        };
      }
    }

    return ids.map((_id) => ({
      _id,
      isSynced: Boolean(syncMap[_id]),
      syncedDate: syncMap[_id]?.syncedDate || null,
      syncedBillNumber: syncMap[_id]?.syncedBillNumber || null,
      syncedCustomer: syncMap[_id]?.syncedCustomer || null,
    }));
  },

  async toCheckMsdCustomers(
    _root,
    { brandId }: { brandId: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdCheck');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    if (!config.customerApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not valid.');
    }

    const { customerApi, username, password } = config;

    const [customers, companies] = await Promise.all([
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'customers',
        action: 'find',
        input: { query: { state: { $ne: 'deleted' } } },
        defaultValue: [],
      }),
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'companies',
        action: 'find',
        input: { query: { status: { $ne: 'deleted' } } },
        defaultValue: [],
      }),
    ]);

    const erxesByCode: Record<string, any> = {};
    for (const c of customers) {
      if (c.code) erxesByCode[c.code] = { ...c, _customerType: 'customer' };
    }
    for (const c of companies) {
      if (c.code) erxesByCode[c.code] = { ...c, _customerType: 'company' };
    }

    const response = await fetch(`${customerApi}?$filter=Type eq 'Customer'`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          'base64',
        )}`,
      },
      timeout: 180000,
    }).then((r) => r.json());

    const msdCustomers = response?.value || [];
    const msdCodes = new Set(msdCustomers.map((r: any) => r.No));

    const result: Record<string, { items: any[] }> = {
      update: { items: [] },
      create: { items: [] },
      delete: { items: [] },
    };

    for (const msd of msdCustomers) {
      try {
        const existing = erxesByCode[msd.No];

        if (!existing) {
          result.create.items.push({
            No: msd.No,
            Name: msd.Name,
            Phone_No: msd.Phone_No,
            E_Mail: msd.E_Mail,
            code: undefined,
          });
        } else if (
          existing.primaryPhone !== msd.Phone_No ||
          existing.primaryEmail !== msd.E_Mail
        ) {
          result.update.items.push({
            No: msd.No,
            Name: msd.Name,
            Phone_No: msd.Phone_No,
            E_Mail: msd.E_Mail,
            code: existing.code,
            primaryPhone: existing.primaryPhone,
            primaryEmail: existing.primaryEmail,
          });
        } else {
          result.match.items.push({
            No: msd.No,
            Name: msd.Name,
            Phone_No: msd.Phone_No,
            E_Mail: msd.E_Mail,
            code: existing.code,
          });
        }
      } catch (e: any) {
        result.error.items.push({
          No: msd.No || '',
          message: e.message,
        });
      }
    }

    for (const code of Object.keys(erxesByCode)) {
      if (!msdCodes.has(code)) {
        const erxes = erxesByCode[code];
        result.delete.items.push({
          _id: erxes._id,
          code,
          primaryPhone: erxes.primaryPhone,
          primaryEmail: erxes.primaryEmail,
        });
      }
    }

    return result;
  },
};
