export default {
  routes: [
    {
      method: "GET",
      path: "/check-loyalties",
      handler: async ({ models, req }) => {
        const url = req.originalUrl as string;

        // const token = req.headers['token'];
        const { ownerType, ownerId } = req.body;
        // models.

      },
    }
  ]
}
