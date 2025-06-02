import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils/utils';
import { createSavingMessage } from '../../../utils/saving/createSavingMessage';
import { activeSaving } from '../../../utils/saving/activeSaving';

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
  }
};
export default checkMutations;
