import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandX,
  IconWorldWww,
} from '@tabler/icons-react';

const PROFILE_ADVANCED_FIELDS = [
  {
    fieldLabel: 'Middle Name',
    fieldName: 'middleName',
    fieldPath: 'details',
    field: { element: 'input', attributes: { type: 'text' } },
  },
  {
    fieldLabel: 'Short Name',
    fieldName: 'shortName',
    fieldPath: 'details',
    field: { element: 'input', attributes: { type: 'text' } },
  },
  {
    fieldLabel: 'User Name',
    fieldName: 'username',
    field: { element: 'input', attributes: { type: 'text' } },
  },
  {
    fieldLabel: 'Employee Id',
    fieldName: 'employeeId',
    fieldPath: 'details',
    field: { element: 'input', attributes: { type: 'text' } },
  },
  {
    fieldLabel: 'Phone (Operator)',
    fieldName: 'operatorPhone',
    fieldPath: 'details',
    field: { element: 'telephone' },
  },
  {
    fieldLabel: 'Join Date',
    fieldName: 'workStartedDate',
    fieldPath: 'details',
    field: { element: 'date' },
  },
  {
    fieldLabel: 'Birth Date',
    fieldName: 'birthDate',
    fieldPath: 'details',
    field: { element: 'date', attributes: { withPresent: true } },
  },
  // { fieldLabel: 'Positions', fieldName: 'positionIds', field: { element: 'select' } },
  // { fieldLabel: 'Location', fieldName: 'location', fieldPath: 'details', field: { element: 'select' } },
];

const PROFILE_LINK_FIELDS = [
  {
    fieldLabel: 'Facebook',
    fieldName: 'facebook',
    fieldPath: 'links',
    icon: IconBrandFacebook,
  },
  {
    fieldLabel: 'Twitter',
    fieldName: 'twitter',
    fieldPath: 'links',
    icon: IconBrandX,
  },
  {
    fieldLabel: 'Website',
    fieldName: 'website',
    fieldPath: 'links',
    icon: IconWorldWww,
  },
  {
    fieldLabel: 'Discord',
    fieldName: 'discord',
    fieldPath: 'links',
    icon: IconBrandDiscord,
  },
  {
    fieldLabel: 'GitHub',
    fieldName: 'github',
    fieldPath: 'links',
    icon: IconBrandGithub,
  },
  {
    fieldLabel: 'Instagram',
    fieldName: 'instagram',
    fieldPath: 'links',
    icon: IconBrandInstagram,
  },
];

export { PROFILE_ADVANCED_FIELDS, PROFILE_LINK_FIELDS };
