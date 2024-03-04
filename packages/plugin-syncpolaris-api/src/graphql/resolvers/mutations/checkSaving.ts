import { IContext } from '../../../connectionResolver';
import {
  getConfig,
  getSavingContracts,
  updateSavingContract,
} from '../../../utils/utils';
import {
  findDiffrentData,
  getCustomFields,
  getSavingAcntPolaris,
  preSyncDatas,
} from '../../../utils/toSyncUtils/utils';

const checkSavingAcntMutations = {
  async toCheckSavings(_root, _params, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    const savingAcounts = await getSavingContracts(subdomain, {});
    let datas: any[] = [];
    for await (const saving of savingAcounts) {
      const preData = await getCustomFields(
        subdomain,
        'savings:contract',
        saving,
      );
      const preSavingContract = preData?.item;
      const responseData = await getSavingAcntPolaris(subdomain, {
        number: preSavingContract.number,
      });
      const result = await findDiffrentData(preSavingContract, responseData);
      if (typeof result !== 'undefined') datas.push(result);
    }
    return {
      SavingContracts: {
        count: datas.length || 0,
        items: datas || [],
      },
    };
  },

  async toSyncSavings(
    _root,
    { savings }: { action: string; savings: any[] },
    { subdomain }: IContext,
  ) {
    for await (const saving of savings) {
      const preData = await getCustomFields(
        subdomain,
        'savings:contract',
        saving,
      );
      const preSavingContract = preData?.item || {};
      const fields = preData?.fields || [];
      let updateData = {};
      const polarisSavingContact = await getSavingAcntPolaris(subdomain, {
        number: preSavingContract.number,
      });

      updateData = await preSyncDatas(
        preSavingContract,
        polarisSavingContact,
        fields,
      );
      if (Object.keys(updateData).length > 0)
        await updateSavingContract(
          subdomain,
          preSavingContract.number,
          updateData,
        );
    }
    return {
      status: 'success',
    };
  },
};

export default checkSavingAcntMutations;
