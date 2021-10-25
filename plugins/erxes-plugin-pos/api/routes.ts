export default {
  routes: [
    {
      method: 'GET',
      path: '/pos/users',
      handler: async ({ req, models }) => {
        if (req.headers.pos_token === 'pos_token') {
          return await models.Users.find();
        }
      }
    }
  ]
};
