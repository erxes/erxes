// DriverGroup

const DriverGroup = {
  async drivers(group: any, _params) {
    return group.driverIds.map(customerId => ({
      _id: customerId,
      __typename: 'Customer'
    }));
  }
};

export { DriverGroup };
