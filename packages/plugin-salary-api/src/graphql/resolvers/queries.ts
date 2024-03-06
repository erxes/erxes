import { salarySchema } from '../../models/definitions/salary';
import { paginate } from '@erxes/api-utils/src/core';

import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';
import { checkPermission, requireLogin } from '@erxes/api-utils/src';

const salaryQueries = {
  async salaryReport(_root, args: any, { models }: IContext) {
    const { page = 1, perPage = 20, employeeId } = args;

    console.log('ajajjajaj');

    const qry: any = {};

    if (employeeId) {
      qry.employeeId = employeeId;
    }

    const list = await paginate(models.Salaries.find(qry), { page, perPage });
    const totalCount = await models.Salaries.find(qry).countDocuments();

    return { list, totalCount };
  },

  async salaryByEmployee(
    _root,
    args: { password: string; page: number; perPage: number },
    { models, user, subdomain }: IContext,
  ) {
    const { password, page = 1, perPage = 20 } = args;
    const employee = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'users.findOne',
      data: {
        _id: user._id,
      },
      isRPC: true,
      defaultValue: null,
    });

    const checkPassword = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'users.comparePassword',
      data: {
        password,
        userPassword: employee.password,
      },
      isRPC: true,
      defaultValue: false,
    });

    if (!checkPassword) {
      throw new Error('Нууц үг буруу байна');
    }

    const list = await paginate(
      models.Salaries.find({ employeeId: employee.employeeId }),
      { page, perPage },
    );

    const totalCount = await models.Salaries.find({
      employeeId: employee.employeeId,
    }).countDocuments();

    return { list, totalCount };
  },

  salaryLabels(_root, _args, _context: IContext) {
    const labels: any = {};
    const exclude = ['createdAt', 'createdBy'];

    Object.keys(salarySchema.paths).forEach((path) => {
      if (
        salarySchema.paths[path].options.label === undefined ||
        exclude.includes(path)
      ) {
        return;
      }
      labels[path] = salarySchema.paths[path].options.label;
    });

    return labels;
  },

  salarySymbols(_root, _args, _context: IContext) {
    const symbmols: any = {};
    const exclude = ['createdAt', 'createdBy'];

    Object.keys(salarySchema.paths).forEach((path) => {
      if (
        salarySchema.paths[path].options.symbol === undefined ||
        exclude.includes(path)
      ) {
        return;
      }
      symbmols[path] = salarySchema.paths[path].options.symbol;
    });

    return symbmols;
  },
};

// requireLogin(salaryQueries, 'salaryReport');
// requireLogin(salaryQueries, 'salaryByEmployee');

// checkPermission(salaryQueries, 'salaryReport', 'showSalaries', []);

export default salaryQueries;
