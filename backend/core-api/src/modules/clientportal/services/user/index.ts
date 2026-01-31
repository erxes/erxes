import {
  findOrCreateCustomer,
  findOrCreateCompany,
  updateCustomerStateToCustomer,
  handleCPContacts,
} from './contactService';
import {
  registerWithSocial,
  loginWithSocial,
  linkSocialAccount,
  unlinkSocialAccount,
} from './socialAuthService';
import {
  checkDuplication,
  registerUser,
  verifyUser,
  login,
  updateUser,
} from './cpUserService';

export * from './contactService';
export * from './socialAuthService';
export * from './cpUserService';

export const contactService = {
  findOrCreateCustomer,
  findOrCreateCompany,
  updateCustomerStateToCustomer,
  handleCPContacts,
};

export const socialAuthService = {
  registerWithSocial,
  loginWithSocial,
  linkSocialAccount,
  unlinkSocialAccount,
};

export const cpUserService = {
  checkDuplication,
  registerUser,
  verifyUser,
  login,
  updateUser,
};
