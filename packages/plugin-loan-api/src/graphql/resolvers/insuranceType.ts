const InsuranceTypes = {
  company(insuranceType) {
    return (
      insuranceType.companyId && {
        __typename: 'User',
        _id: insuranceType.companyId
      }
    );
  },
  yearPercents(insuranceType) {
    return insuranceType.yearPercents.join(', ');
  }
};

export default InsuranceTypes;
