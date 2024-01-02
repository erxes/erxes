import { getConfig, toErkhet } from './utils';

export const userToErkhet = async (
  subdomain,
  models,
  syncLog,
  params,
  action
) => {
  const user = params.updatedDocument || params.object;
  const oldUser = params.object;

  const config = await getConfig(subdomain, 'ERKHET', {});

  let sendData = {};

  sendData = {
    action,
    oldEmail: oldUser.email || '',
    object: {
      firstName: user.details?.firstName,
      lastName: user.details?.lastName,
      email: user.email || '',
      employeeId: user.employeeId
    }
  };

  toErkhet(models, syncLog, config, sendData, 'user-change');
};
