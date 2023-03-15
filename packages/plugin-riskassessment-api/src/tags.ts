export default {
  types: [
    {
      description: 'Risk Assessments',
      type: 'riskassessment'
    }
  ],
  tag: async ({ subdomain, data }) => {
    console.log({ data });
  },
  fixRelatedItems: async ({ data }) => {
    console.log({ data });
  }
};
