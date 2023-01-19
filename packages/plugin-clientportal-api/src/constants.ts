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
