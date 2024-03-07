import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils/utils';
import {
  findCustomFieldType,
  findDiffrentData,
  getCustomFields,
  getMainDatas,
  getPolarisData,
} from '../../../utils/toSyncUtils/utils';

('savings:contract');

const checkMutations = {
  async toCheck(
    _root,
    _params,
    { type }: { type: string },
    { subdomain }: IContext,
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    const customFieldType = findCustomFieldType(type);

    const items: any[] = await getMainDatas(subdomain, type);

    let datas: any = [];
    for await (const item of items) {
      const preData = await getCustomFields(subdomain, customFieldType, item);
      const preCheckDatas = preData?.item;
      const polarisData = await getPolarisData(
        type,
        subdomain,
        preCheckDatas.code,
      );
      const result = await findDiffrentData(preCheckDatas, polarisData);
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
