import { IContext } from '../../connectionResolver';
import { fetchPolarisData } from '../../utils';

const polarissyncMutations = {
  /**
   * Creates a new polarissync
   */
  async bidUpdatePolarisData(_root, doc, { subdomain, models }: IContext) {
    return fetchPolarisData(models, subdomain, doc);
  },
};

export default polarissyncMutations;
