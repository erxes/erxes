const sendError = message => ({
  status: 'error',
  errorMessage: message
});

const sendSuccess = data => ({
  status: 'success',
  data
});

export default [
  {
    method: 'RPCQueue',
    channel: 'rpc_queue:erxes-pos',
    handler: async (msg, { models }) => {
      const { action, data } = msg;
      let filter = {};
      let sort = {};

      switch (action) {
        case 'getUsers':
          try {
            filter = {};
            sort = { username: 1 };

            const users = models.Users.find(filter).sort(sort);

            return sendSuccess({
              users
            });
          } catch (e) {
            return sendError(e.message);
          }
      }
    }
  }
];
