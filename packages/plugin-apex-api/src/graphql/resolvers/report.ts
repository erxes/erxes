const report = {
  async company(report) {
    return {
      __typename: 'Company',
      _id: report.companyId
    };
  }
};

export default report;
