import {
  sendEmail,
  sendSMS,
  sendOTPEmail,
  sendOTPSMS,
  sendOTP,
  createNotification,
  sendNotification,
} from './notificationService';

export * from './notificationService';
export { firebaseService } from './firebaseService';

export const notificationService = {
  sendEmail,
  sendSMS,
  sendOTPEmail,
  sendOTPSMS,
  sendOTP,
  createNotification,
  sendNotification,
};
