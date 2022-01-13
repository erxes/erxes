
export const LEAD_CHOICES = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'attemptedToContact' },
  { label: 'Working', value: 'inProgress' },
  { label: 'Bad timing', value: 'badTiming' },
  { label: 'Unqualified', value: 'unqualified' }
];

export const CUSTOMER_BASIC_INFO = {
  avatar: 'Avatar',
  firstName: 'First Name',
  lastName: 'Last Name',
  primaryEmail: 'Primary E-mail',
  primaryPhone: 'Primary Phone',
  position: 'Position',
  department: 'Department',
  hasAuthority: 'Has Authority',
  description: 'Description',
  isSubscribed: 'Subscribed',

  ALL: [
    { field: 'avatar', label: 'Avatar' },
    { field: 'firstName', label: 'First Name' },
    { field: 'middleName', label: 'Middle Name' },
    { field: 'lastName', label: 'Last Name' },
    { field: 'primaryEmail', label: 'Primary E-mail' },
    { field: 'primaryPhone', label: 'Primary Phone' },
    { field: 'position', label: 'Position' },
    { field: 'department', label: 'Department' },
    { field: 'hasAuthority', label: 'Has Authority' },
    { field: 'description', label: 'Description' },
    { field: 'isSubscribed', label: 'Subscribed' }
  ]
};

export const CUSTOMER_DATAS = {
  visitorContactInfo: 'Visitor contact info',
  owner: 'Owner',
  links: 'Links',

  ALL: [
    { field: 'visitorContactInfo', label: 'Visitor contact info' },
    { field: 'owner', label: 'Owner' },
    { field: 'links', label: 'Links' }
  ]
};

export const CUSTOMER_LINKS = {
  linkedIn: 'LinkedIn',
  twitter: 'Twitter',
  facebook: 'Facebook',
  youtube: 'Youtube',
  github: 'Github',
  website: 'Website',

  ALL: [
    { field: 'linkedIn', label: 'LinkedIn' },
    { field: 'twitter', label: 'Twitter' },
    { field: 'facebook', label: 'Facebook' },
    { field: 'youtube', label: 'Youtube' },
    { field: 'github', label: 'Github' },
    { field: 'website', label: 'Website' }
  ]
};