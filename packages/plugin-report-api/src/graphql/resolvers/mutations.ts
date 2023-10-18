import { Reports } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const reportMutations = {
  /**
   * Creates a new report
   */
  async reportsAdd(_root, doc, _context: IContext) {
    const report = await Reports.createReport(doc);

    return report;
  }
};

export default reportMutations;
