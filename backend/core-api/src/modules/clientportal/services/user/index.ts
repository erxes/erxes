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
import { loginWithCredentials } from '~/modules/clientportal/services/auth/login';
import { registerUser, verifyUser, updateUser } from './cpUserService';
import {
  requestChangeEmail,
  confirmChangeEmail,
  requestChangePhone,
  confirmChangePhone,
} from './changeContactService';

export * from './contactService';
export * from './socialAuthService';
export * from './cpUserService';
export * from './changeContactService';

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
  registerUser,
  verifyUser,
  login: loginWithCredentials,
  updateUser,
};

export const changeContactService = {
  requestChangeEmail,
  confirmChangeEmail,
  requestChangePhone,
  confirmChangePhone,
};
