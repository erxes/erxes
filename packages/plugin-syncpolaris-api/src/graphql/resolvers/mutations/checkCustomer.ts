import { IContext } from '../../../connectionResolver';
import { getConfig, getCustomers, updateCustomer } from '../../../utils/utils';
import {
  findDiffrentData,
  getCustomFields,
  getCustomPolaris,
  preSyncDatas,
} from '../../../utils/toSyncUtils/utils';

const checkMutations = {
  async toCheckCustomers(_root, _params, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'POLARIS', {});
    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }
    const customers = await getCustomers(subdomain, {});
    let datas: any = [];
    for await (const customer of customers) {
      const preData = await getCustomFields(
        subdomain,
        'contacts:customer',
        customer,
      );
      const preCustomer = preData?.item;
      const polarisCustomer = await getCustomPolaris(
        subdomain,
        preCustomer.code,
      );
      const result = await findDiffrentData(preCustomer, polarisCustomer);
      if (typeof result !== 'undefined') datas.push(result);
    }

    return {
      diffCustomer: {
        count: datas.length,
        items: datas,
      },
    };
  },

  async toSyncCustomers(
    _root,
    { customers }: { customers: any[] },
    { subdomain }: IContext,
  ) {
    try {
      for await (const customer of customers) {
        const preData = await getCustomFields(
          subdomain,
          'contacts:customer',
          customer,
        );
        const preCustomer = preData?.item || {};
        const fields = preData?.fields || [];
        let updateData = {};
        const polarisCustomer = await getCustomPolaris(
          subdomain,
          preCustomer.code,
        );
        updateData = await preSyncDatas(preCustomer, polarisCustomer, fields);
        if (Object.keys(updateData).length > 0)
          await updateCustomer(subdomain, preCustomer.code, updateData);
      }
      return {
        status: 'success',
      };
    } catch (e) {
      throw new Error('Error while syncing customer. ' + e);
    }
  },
};
export default checkMutations;
