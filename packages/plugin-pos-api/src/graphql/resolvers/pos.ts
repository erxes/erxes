import { sendCoreMessage } from '../../messageBroker';

const resolvers = {
  user: (pos, {}, { subdomain }) => {
    if (!pos.userId) {
      return null;
    }

    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: pos.userId },
      isRPC: true
    });
  },

  branchTitle: async (pos, {}, { subdomain }) => {
    if (!pos.branchId) {
      return '';
    }

    const branch = await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: pos.branchId },
      isRPC: true
    });

    return branch ? branch.title : '' || '';
  },

  departmentTitle: async (pos, {}, { subdomain }) => {
    if (!pos.departmentId) {
      return '';
    }

    const department = await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: pos.departmentId },
      isRPC: true
    });

    return department ? department.title : '' || '';
  }
};

export default resolvers;
