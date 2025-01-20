import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils/utils';
import {
  findDiffrentData,
  getCustomFields,
  getMainDatas,
  getPolarisData,
} from '../../../utils/toSyncUtils/utils';

const checkMutations = {
  async toCheckPolaris(_root, { type }: { type: string }, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    const items: any[] = await getMainDatas(subdomain, type);
    let datas: any = [];
    for await (const item of items) {
      const preData = await getCustomFields(subdomain, type, item);
      const preCheckData = preData?.item;
      const polarisData = await getPolarisData(type, subdomain, config, preCheckData);
      const result = await findDiffrentData(preCheckData, polarisData);
      if (typeof result !== 'undefined') datas.push(result);
    }

    return {
      results: {
        count: datas.length,
        items: datas,
      },
    };
  },
};
export default checkMutations;
