export default {
  routes: [
    {
      method: "POST",
      path: "/test",
      handler: async ({ models }) => {
        console.log('sssss', await models.Cars.find());
      }
    }
  ]
}