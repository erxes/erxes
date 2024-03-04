import { IContext } from '../../../connectionResolver';
import {
  getConfig,
  getLoanContracts,
  updateLoanContract,
} from '../../../utils/utils';
import {
  findDiffrentData,
  getCustomFields,
  getLoanAcntPolaris,
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
      const preData = await getCustomFields(
        subdomain,
        'loans:contract',
        loanContract,
      );
      const preLoanContract = preData?.item;
      const polarisLoan = await getLoanAcntPolaris(
        subdomain,
        preLoanContract.number,
      );
      const result = await findDiffrentData(preLoanContract, polarisLoan);
      if (typeof result !== 'undefined') datas.push(result);
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
    { loans }: { action: string; loans: any[] },
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
        const polarisLoanContact = await getLoanAcntPolaris(
          subdomain,
          preLoanContract.number,
        );
        updateData = await preSyncDatas(
          preLoanContract,
          polarisLoanContact,
          fields,
        );
        if (Object.keys(updateData).length > 0)
          await updateLoanContract(
            subdomain,
            preLoanContract.number,
            updateData,
          );
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
