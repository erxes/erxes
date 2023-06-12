export const CLIENTPORTALUSER_BASIC_INFO = {
  avatar: 'Avatar',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  userName: 'userName',
  phone: 'phone',
  code: 'code',
  companyName: 'companyName',
  companyRegistrationNumber: 'companyRegistrationNumber',
  erxesCompanyId: 'erxesCompanyId',
  erxesCustomerId: 'erxesCustomerId',
  phoneVerificationCode: 'phoneVerificationCode',
  phoneVerificationCodeExpires: 'phoneVerificationCodeExpires',
  emailVerificationCode: 'emailVerificationCode',
  emailVerificationCodeExpires: 'emailVerificationCodeExpires',
  isPhoneVerified: 'isPhoneVerified',
  isEmailVerified: 'isEmailVerified',

  ALL: [
    { field: 'avatar', label: 'Avatar', canHide: false },
    { field: 'firstName', label: 'First Name', canHide: false },
    { field: 'lastName', label: 'lastName', canHide: true },
    { field: 'email', label: 'email', canHide: false },
    { field: 'userName', label: 'userName', canHide: false },
    { field: 'phone', label: 'phone', canHide: true },
    { field: 'code', label: 'code', canHide: true },
    { field: 'companyName', label: 'companyName', canHide: true },
    {
      field: 'companyRegistrationNumber',
      label: 'companyRegistrationNumber',
      canHide: true
    },
    { field: 'erxesCompanyId', label: 'erxesCompanyId', canHide: true },
    { field: 'erxesCustomerId', label: 'erxesCustomerId', canHide: true },
    {
      field: 'phoneVerificationCode',
      label: 'phoneVerificationCode',
      canHide: true
    },
    {
      field: 'phoneVerificationCodeExpires',
      label: 'phoneVerificationCodeExpires',
      canHide: true
    },
    {
      field: 'emailVerificationCode',
      label: 'emailVerificationCode',
      canHide: true
    },
    {
      field: 'emailVerificationCodeExpires',
      label: 'emailVerificationCodeExpires',
      canHide: true
    },
    { field: 'isPhoneVerified', label: 'isPhoneVerified', canHide: true },
    { field: 'isEmailVerified', label: 'isEmailVerified', canHide: true }
  ]
};

export const CLOSE_DATE_TYPES = {
  NEXT_DAY: 'nextDay',
  NEXT_WEEK: 'nextWeek',
  NEXT_MONTH: 'nextMonth',
  NO_CLOSE_DATE: 'noCloseDate',
  OVERDUE: 'overdue',
  ALL: [
    {
      name: 'Next day',
      value: 'nextDay'
    },
    {
      name: 'Next week',
      value: 'nextWeek'
    },
    {
      name: 'Next month',
      value: 'nextMonth'
    },
    {
      name: 'No close date',
      value: 'noCloseDate'
    },
    {
      name: 'Over due',
      value: 'overdue'
    }
  ]
};
