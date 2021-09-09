export default {
  routes: [
    {
      method: "GET",
      path: "/get-branding",
      handler: async ({ models }) => {
        const branding = await models.CompanyBrandings.findOne();

        if(branding)
        return branding;
        return {"error":"Not found"}
      }
    }
  ]
}