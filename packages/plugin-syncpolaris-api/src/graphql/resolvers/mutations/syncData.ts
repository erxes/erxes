import { IContext } from '../../../connectionResolver';
import {
  getCustomFields,
  getPolarisData,
  preSyncDatas,
  syncDataToErxes,
} from '../../../utils/toSyncUtils/utils';
import { getConfig } from '../../../utils/utils';

const syncmutations = {
  async toSyncPolaris(
    _root,
    { items, type }: { items: any[]; type: string },
    { subdomain }: IContext,
  ) {
    try {
      const preCustomFields = await getCustomFields(subdomain, type);
      const customFields = preCustomFields.fields;
      const polarisConfig = await getConfig(subdomain, 'POLARIS', {});
      
      for await (const item of items) {
        const polarisData = await getPolarisData(type, subdomain, polarisConfig, item);
        const updateData = await preSyncDatas(item, polarisData, customFields);
        if (Object.keys(updateData).length > 0)
          await syncDataToErxes(type, subdomain, item, updateData);
      }
      return {
        status: 'success',
      };
    } catch (e) {
      throw new Error('Error while syncing . ' + e);
    }
  },
};
export default syncmutations;
