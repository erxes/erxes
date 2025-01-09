export default {
  getScoreCampaingAttributes: async ({ subdomain }) => {
    return [{ label: "Sales Total Amount", value: "productsData.amount" }];
  }
};
