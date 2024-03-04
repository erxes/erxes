import { IContext } from '../../../connectionResolver';
import {
  getConfig,
  getSavingContracts,
  updateSavingContract,
} from '../../../utils/utils';
import { getSavingDetail } from '../../../utils/saving/getSavingDetail';
import {
  findDiffrentData,
  getCustomFields,
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
      if (typeof saving.number !== 'undefined') {
        try {
          const preData = await getCustomFields(
            subdomain,
            'savings:contract',
            saving,
          );
          const preSavingContract = preData?.item;
          const responseData = await getSavingDetail(subdomain, {
            number: preSavingContract.number,
          });
          if (responseData && Object.keys(responseData).length > 0) {
            const result = await findDiffrentData(
              preSavingContract,
              responseData,
            );
            if (typeof result !== 'undefined') datas.push(result);
          }
        } catch (error) {
          console.log('error:', error);
        }
      }
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
    { action, savings }: { action: string; savings: any[] },
    { subdomain }: IContext,
  ) {
    try {
      for await (const saving of savings) {
        const preData = await getCustomFields(
          subdomain,
          'savings:contract',
          saving,
        );
        const preSavingContract = preData?.item || {};
        const fields = preData?.fields || [];
        let updateData = {};
        const polarisSavingContact = await getSavingDetail(subdomain, {
          number: preSavingContract.number,
        });
        if (
          polarisSavingContact &&
          Object.keys(polarisSavingContact).length > 0
        ) {
          updateData = await preSyncDatas(
            preSavingContract,
            polarisSavingContact,
            fields,
          );
          //if(Object.keys(updateData).length > 0)
          //await updateSavingContract(subdomain,preSavingContract.number,updateData);
        }
      }
      return {
        status: 'success',
      };
    } catch (e) {
      throw new Error('Error while syncing saving contract. ' + e);
    }
  },
};

export default checkSavingAcntMutations;
