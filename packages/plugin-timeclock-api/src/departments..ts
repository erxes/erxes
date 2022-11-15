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

export const findAllBranches = async (
  subdomain: string,
  searchValue: string
) => {
  const filter: { parentId?: any; $or?: any[] } = {};

  if (searchValue) {
    const regexOption = {
      $regex: `.*${searchValue.trim()}.*`,
      $options: 'i'
    };

    filter.$or = [
      {
        title: regexOption
      },
      {
        address: regexOption
      }
    ];
  }

  const branches = await sendCoreMessage({
    subdomain,
    action: 'branches.find',
    data: { filter },
    isRPC: true
  });

  return branches;
};
