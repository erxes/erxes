import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils/utils';
import { activeLoan } from '../../../utils/loan/activeLoan';
import { createLoanMessage } from '../../../utils/loan/createLoanMessage';
import { createCollateral } from '../../../utils/collateral/createCollateral';
import { createLoanSchedule } from '../../../utils/loan/createSchedule';

const loansMutations = {
  async sendContractToPolaris(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    await createLoanMessage(subdomain, config, data);

    return 'success';
  },

  async syncLoanCollateral(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    await createCollateral(subdomain, config, data);

    return 'success';
  },

  async sendLoanSchedules(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    await createLoanSchedule(subdomain, config, data);

    return 'success';
  },

  async loanContractActive(
    _root,
    { contractNumber }: { contractNumber: string },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    await activeLoan(subdomain, config, contractNumber);

    return 'success';
  }
};
export default loansMutations;
