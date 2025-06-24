export default {
  types: [{ description: "Voucher", type: "voucher" }],
  fields: async () => [
    {
      _id: Math.random(),
      name: "campaignId",
      label: "Voucher",
      type: "String",
      selectionConfig: {
        queryName: "voucherCampaigns",
        labelField: "title",
        idsField: "_ids",
        multi: true
      }
    }
  ]
};
