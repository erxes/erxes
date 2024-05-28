import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { ISalary } from '../../models/definitions/salary';

export default {
  async employee(salary: ISalary, _args, { subdomain }: IContext) {
    return await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      isRPC: true,
      data: {
        employeeId: salary.employeeId
      },
      defaultValue: null
    });
  }
};
