import { loginWithOTP, checkOTPResendLimit } from './otpService';
import {
  generateVerificationCode,
  sendVerificationEmail,
  validateVerificationCode,
  isVerificationCodeExpired,
  sendOTPForLogin,
} from './verificationService';
import {
  forgotPassword,
  resetPasswordWithToken,
  resetPasswordWithCode,
} from './passwordService';

export * from './otpService';
export * from './verificationService';
export * from './passwordService';
export * from './helpers/actionCodeHelper';
export * from './helpers/otpConfigHelper';
export * from './helpers/otpSenderHelper';
export * from './helpers/validators';

export const otpService = {
  loginWithOTP,
  checkOTPResendLimit,
};

export const verificationService = {
  generateVerificationCode,
  sendVerificationEmail,
  validateVerificationCode,
  isVerificationCodeExpired,
  sendOTPForLogin,
};

export const passwordService = {
  forgotPassword,
  resetPasswordWithToken,
  resetPasswordWithCode,
};
