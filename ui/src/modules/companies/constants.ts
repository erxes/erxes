import { getConstantFromStore } from 'modules/common/utils';

export const COMPANY_INFO = {
  avatar: 'Logo',
  primaryName: 'Primary Name',
  size: 'Size',
  industry: 'Industry',
  plan: 'Plan',
  primaryEmail: 'Primary Email',
  primaryPhone: 'Primary Phone',
  businessType: 'Business Type',
  description: 'Description',
  doNotDisturb: 'Do not disturb',

  ALL: [
    { field: 'avatar', label: 'Logo' },
    { field: 'primaryName', label: 'Primary Name' },
    { field: 'size', label: 'Size' },
    { field: 'industry', label: 'Industry' },
    { field: 'plan', label: 'Plan' },
    { field: 'primaryEmail', label: 'Primary Email' },
    { field: 'primaryPhone', label: 'Primary Phone' },
    { field: 'businessType', label: 'Business Type' },
    { field: 'description', label: 'Description' },
    { field: 'doNotDisturb', label: 'Do not disturb' }
  ]
};

export const COMPANY_LINKS = {
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

export const COMPANY_DATAS = {
  owner: 'Owner',
  parentCompany: 'Parent Company',
  links: 'Links',

  ALL: [
    { field: 'owner', label: 'Owner' },
    { field: 'parentCompany', label: 'Parent Company' },
    { field: 'links', label: 'Links' }
  ]
};

export const COMPANY_INDUSTRY_TYPES = () => {
  return getConstantFromStore('company_industry_types', false, true);
};

export const COMPANY_BUSINESS_TYPES = [
  'Competitor',
  'Customer',
  'Investor',
  'Partner',
  'Press',
  'Prospect',
  'Reseller',
  'Other'
];
