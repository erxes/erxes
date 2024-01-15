import { IContext } from '../../connectionResolvers';
import { fetchPolarisData } from '../../utils';

const polarissyncMutations = {
  /**
   * Creates a new polarissync
   */
  async bidUpdatePolarisData(_root, doc, { subdomain }: IContext) {
    return fetchPolarisData(subdomain, doc);
  },
};

export default polarissyncMutations;
