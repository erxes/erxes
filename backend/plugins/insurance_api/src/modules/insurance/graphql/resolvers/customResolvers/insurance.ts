export const Insurance = {
  async description() {
    return 'Insurance description';
  },
};

export const InsuranceProduct = {
  id(product: any) {
    return product._id || product.id;
  },
};

export const InsuranceType = {
  id(type: any) {
    return type._id || type.id;
  },
};

export const RiskType = {
  id(risk: any) {
    return risk._id || risk.id;
  },
};

export const InsuranceVendor = {
  id(vendor: any) {
    return vendor._id || vendor.id;
  },
};

export const InsuranceCustomer = {
  id(customer: any) {
    return customer._id || customer.id;
  },
};

export const InsuranceContract = {
  id(contract: any) {
    return contract._id || contract.id;
  },
};

export const InsuranceVendorUser = {
  id(user: any) {
    return user._id || user.id;
  },
};
