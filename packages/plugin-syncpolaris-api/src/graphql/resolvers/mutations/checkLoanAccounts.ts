import { IContext } from '../../../connectionResolver';
import {
  getConfig,
  getLoanContracts,
  updateLoanContract,
} from '../../../utils/utils';
import { getLoanDetail } from '../../../utils/loan/getLoanDetail';
import {
  findDiffrentData,
  getCustomFields,
  preSyncDatas,
} from '../../../utils/toSyncUtils/utils';

const checkLoanAcntMutations = {
  async toCheckLoans(_root, _params, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    const loanContracts = await getLoanContracts(subdomain, {});
    let datas: any[] = [];
    for await (const loanContract of loanContracts) {
      if (typeof loanContract.number !== 'undefined') {
        try {
          const preData = await getCustomFields(
            subdomain,
            'loans:contract',
            loanContract,
          );
          const preLoanContract = preData?.item;
          const responseData = await getLoanDetail(subdomain, {
            number: preLoanContract.number,
          });
          if (responseData && Object.keys(responseData).length > 0) {
            const result = await findDiffrentData(
              preLoanContract,
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
      loanContracts: {
        count: datas.length,
        items: datas,
      },
    };
  },

  async toSyncLoans(
    _root,
    { action, loans }: { action: string; loans: any[] },
    { subdomain }: IContext,
  ) {
    try {
      for await (const loan of loans) {
        const preData = await getCustomFields(
          subdomain,
          'loans:contract',
          loan,
        );
        const preLoanContract = preData?.item || {};
        const fields = preData?.fields || [];
        let updateData = {};
        const polarisLoanContact = await getLoanDetail(subdomain, {
          number: preLoanContract.number,
        });
        if (polarisLoanContact && Object.keys(polarisLoanContact).length > 0) {
          const { _id, __v, ...data } = preLoanContract;
          updateData = await preSyncDatas(data, polarisLoanContact, fields);
          if (Object.keys(updateData).length > 0)
            await updateLoanContract(
              subdomain,
              preLoanContract.number,
              updateData,
            );
        }
      }
      return {
        status: 'success',
      };
    } catch (e) {
      throw new Error('Error while syncing loan contract. ' + e);
    }
  },
};

export default checkLoanAcntMutations;
