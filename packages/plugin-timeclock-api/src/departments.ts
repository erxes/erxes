import { sendCoreMessage } from './messageBroker';

export const findDepartment = async (subdomain: string, target) => {
  const department = await sendCoreMessage({
    subdomain,
    action: 'departments.findOne',
    data: { _id: target },
    isRPC: true
  });

  return department;
};

export const findBranch = async (subdomain: string, target) => {
  const branch = await sendCoreMessage({
    subdomain,
    action: 'branches.findOne',
    data: { _id: target },
    isRPC: true
  });

  return branch;
};
