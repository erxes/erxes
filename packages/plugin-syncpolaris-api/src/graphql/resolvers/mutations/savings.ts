import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils/utils';
import { createSavingMessage } from '../../../utils/saving/createSavingMessage';
import { activeSaving } from '../../../utils/saving/activeSaving';
import { incomeSaving } from '../../../utils/saving/incomeSaving';
import { incomeDeposit } from '../../../utils/deposit/incomeDeposit';

const checkMutations = {
  async sendSaving(
    _root,
    { data }: { data: any },
    { subdomain, user }: IContext
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    await createSavingMessage(subdomain, config, data, user);

    return 'success';
  },

  async savingContractActive(
    _root,
    { contractNumber }: { contractNumber: string },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    await activeSaving(subdomain, config, contractNumber);

    return 'success';
  },

  async sendSavingAmount(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    await incomeSaving(subdomain, config, data);

    return 'success';
  },

  async sendDepositAmount(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'POLARIS', {});

    if (!config.token) {
      throw new Error('POLARIS config not found.');
    }

    await incomeDeposit(subdomain, config, data);

    return 'success';
  }
};
export default checkMutations;
