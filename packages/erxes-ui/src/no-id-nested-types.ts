/* only nested types 
    1. with no identifier field
    2. that don't become array elements
    3. with more than 1 field
*/
export default [
  'UserDetailsType',
  'Coordinate',
  'TimeTrack',
  'OTPConfig',
  'MailConfig',
  'ManualVerificationConfig',
  'PasswordVerificationConfig',
  'Styles',
  'UserNotificationSettings',
  'VerificationRequest',
  'EngageScheduleDate',
  'EngageMessageSms',
  'EngageData',
  'MailData',
  'VideoCallData',
  'BookingData',
  // < Types from community repo. Everything uses OS build of the core-ui, until better solution is found we have to include them here
  'ItemSourceLocation',
  'CalcedInfo'
  // <\ Types from community repo. Everything uses OS build of the core-ui, until better solution is found we have to include them here
];
