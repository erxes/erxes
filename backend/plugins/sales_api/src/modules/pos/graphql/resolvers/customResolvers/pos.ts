import { sendTRPCMessage } from "erxes-api-shared/utils";

const resolvers = {
  user: async (pos,) => {
    if (!pos.userId) {
      return null;
    }
    return sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { _id: pos.userId },
    });
  },

  branchTitle: async (pos,) => {
    if (!pos.branchId) {
      return '';
    }

    const branch = await sendTRPCMessage({
      pluginName: 'core',
      module: 'branches',
      action: 'findOne',
      input: { _id: pos.branchId },
    });

    return branch?.title || '';
  },

  departmentTitle: async (pos,) => {
    if (!pos.departmentId) {
      return '';
    }

    const department = await sendTRPCMessage({
      pluginName: 'core',
      module: 'departments',
      action: 'findOne',
      input: { _id: pos.departmentId },
    });

    return department?.title || '';
  }
};

export default resolvers;
