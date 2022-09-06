export const BOARD_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived']
};

export const USER_LOGIN_TYPES = {
  COMPANY: 'company',
  CUSTOMER: 'customer',
  ALL: ['customer', 'company']
};

export const DEFAULT_MAIL_CONFIG = {
  INVITE:
    'Here is your verification link: {{ link }} <br /> Please click on the link to verify your account. Your password is: {{ password }} <br /> Please change your password after you login.`',
  REGISTER:
    'Here is your verification link: {{ link }} <br /> Please click on the link to verify your account.'
};
