import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const salaryMutations = {
  /**
   * Removes a single salary report
   */
  async removeSalaryReport(_root, { _id }, { models }: IContext) {
    return models.Salaries.deleteOne({ _id });
  },
  async addSalaryReport(_root, docs, { models }: IContext) {
    return models.Salaries.createSalary(docs);
  },
};

requireLogin(salaryMutations, 'removeSalaryReport');

checkPermission(salaryMutations, 'removeSalaryReport', 'removeSalaries', []);

export default salaryMutations;
