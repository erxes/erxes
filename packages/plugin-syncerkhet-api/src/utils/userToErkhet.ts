import { toErkhet } from './utils';

export const userToErkhet = async (
  models,
  mainConfig,
  syncLog,
  params,
  action,
) => {
  const user = params.updatedDocument || params.object;
  const oldUser = params.object;

  let sendData = {};

  sendData = {
    action,
    oldEmail: oldUser.email || '',
    object: {
      firstName: user.details?.firstName,
      lastName: user.details?.lastName,
      email: user.email || '',
      employeeId: user.employeeId,
    },
  };

  toErkhet(models, syncLog, mainConfig, sendData, 'user-change');
};
