import { TAutomationRuntimeOutputDefinition } from 'erxes-api-shared/core-modules';
import { resolveUserLabelByIdField } from './outputHelpers';

export const WEBHOOK_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'targetId', label: 'Target ID', exposure: 'reference' },
    { key: 'endpoint', label: 'Endpoint' },
    { key: 'method', label: 'Method' },
    { key: 'body', label: 'Body' },
    { key: 'query', label: 'Query' },
    { key: 'headers', label: 'Headers', exposure: 'reference' },
  ],
};

export const TEAM_MEMBER_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'email', label: 'Email' },
    { key: 'username', label: 'Username' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
    { key: 'chatStatus', label: 'Chat Status' },
    { key: 'isActive', label: 'Active' },
    { key: 'isOwner', label: 'Owner' },
    { key: 'isSubscribed', label: 'Subscribed' },
    { key: 'isShowNotification', label: 'Show Notifications' },
    { key: 'isOnboarded', label: 'Onboarded' },
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'score', label: 'Score' },
    { key: 'leaderBoardPosition', label: 'Leaderboard Position' },
    { key: 'details.fullName', label: 'Full Name' },
    { key: 'details.shortName', label: 'Short Name' },
    { key: 'details.firstName', label: 'First Name' },
    { key: 'details.middleName', label: 'Middle Name' },
    { key: 'details.lastName', label: 'Last Name' },
    { key: 'details.avatar', label: 'Avatar' },
    { key: 'details.coverPhoto', label: 'Cover Photo' },
    { key: 'details.position', label: 'Position' },
    { key: 'details.location', label: 'Location' },
    { key: 'details.description', label: 'Description' },
    { key: 'details.operatorPhone', label: 'Phone' },
    { key: 'details.birthDate', label: 'Birth Date' },
    { key: 'details.workStartedDate', label: 'Work Started Date' },
    { key: 'links', label: 'Links' },
    { key: 'createdAt', label: 'Created At' },
    { key: '_id', label: 'Record ID', exposure: 'reference' },
    { key: 'groupIds', label: 'Groups', exposure: 'reference' },
    { key: 'brandIds', label: 'Brands', exposure: 'reference' },
    { key: 'branchIds', label: 'Branches', exposure: 'reference' },
    { key: 'departmentIds', label: 'Departments', exposure: 'reference' },
    { key: 'positionIds', label: 'Positions', exposure: 'reference' },
    {
      key: 'permissionGroupIds',
      label: 'Permission Groups',
      exposure: 'reference',
    },
  ],
  propertySources: [
    {
      key: 'properties',
      label: 'Team Member Properties',
      propertyType: 'core:user',
    },
  ],
};

export const CUSTOMER_BASE_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'state', label: 'State' },
    { key: 'status', label: 'Status' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'middleName', label: 'Middle Name' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'birthDate', label: 'Birth Date' },
    { key: 'sex', label: 'Pronoun' },
    { key: 'primaryEmail', label: 'Primary Email' },
    { key: 'emails', label: 'Emails' },
    { key: 'emailValidationStatus', label: 'Email Validation Status' },
    { key: 'primaryPhone', label: 'Primary Phone' },
    { key: 'phones', label: 'Phones' },
    { key: 'phoneValidationStatus', label: 'Phone Validation Status' },
    { key: 'primaryAddress', label: 'Primary Address' },
    { key: 'addresses', label: 'Addresses' },
    { key: 'description', label: 'Description' },
    { key: 'doNotDisturb', label: 'Do Not Disturb' },
    { key: 'isSubscribed', label: 'Subscribed' },
    { key: 'links', label: 'Links' },
    { key: 'code', label: 'Code' },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'leadStatus', label: 'Lead Status' },
    { key: 'hasAuthority', label: 'Has Authority' },
    { key: 'location', label: 'Location' },
    { key: 'hostname', label: 'Host Name' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Updated At' },
    { key: '_id', label: 'Record ID', exposure: 'reference' },
    { key: 'ownerId', label: 'Owner ID', exposure: 'reference' },
    { key: 'owner', label: 'Owner' },
    { key: 'tagIds', label: 'Tags', exposure: 'reference' },
    {
      key: 'integrationId',
      label: 'Integration',
      exposure: 'reference',
    },
    {
      key: 'relatedIntegrationIds',
      label: 'Related Integrations',
      exposure: 'reference',
    },
    { key: 'mergedIds', label: 'Merged IDs', exposure: 'reference' },
  ],
  resolvers: {
    owner: resolveUserLabelByIdField('ownerId'),
  },
};

export const CUSTOMER_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition = {
  ...CUSTOMER_BASE_TRIGGER_OUTPUT,
  propertySources: [
    {
      key: 'properties',
      label: 'Customer Properties',
      propertyType: 'core:customer',
    },
  ],
};

export const LEAD_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition = {
  ...CUSTOMER_BASE_TRIGGER_OUTPUT,
  propertySources: [
    {
      key: 'properties',
      label: 'Lead Properties',
      propertyType: 'core:customer',
    },
  ],
};

export const COMPANY_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'primaryName', label: 'Name' },
    { key: 'names', label: 'Names' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'size', label: 'Size' },
    { key: 'industry', label: 'Industry' },
    { key: 'website', label: 'Website' },
    { key: 'primaryEmail', label: 'Primary Email' },
    { key: 'emails', label: 'Emails' },
    { key: 'primaryPhone', label: 'Primary Phone' },
    { key: 'phones', label: 'Phones' },
    { key: 'primaryAddress', label: 'Primary Address' },
    { key: 'addresses', label: 'Addresses' },
    { key: 'status', label: 'Status' },
    { key: 'businessType', label: 'Business Type' },
    { key: 'description', label: 'Description' },
    { key: 'employees', label: 'Employees' },
    { key: 'doNotDisturb', label: 'Do Not Disturb' },
    { key: 'isSubscribed', label: 'Subscribed' },
    { key: 'links', label: 'Links' },
    { key: 'code', label: 'Code' },
    { key: 'location', label: 'Location' },
    { key: 'score', label: 'Score' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Updated At' },
    { key: '_id', label: 'Record ID', exposure: 'reference' },
    { key: 'ownerId', label: 'Owner ID', exposure: 'reference' },
    { key: 'owner', label: 'Owner' },
    {
      key: 'parentCompanyId',
      label: 'Parent Company',
      exposure: 'reference',
    },
    { key: 'tagIds', label: 'Tags', exposure: 'reference' },
    { key: 'mergedIds', label: 'Merged IDs', exposure: 'reference' },
  ],
  propertySources: [
    {
      key: 'properties',
      label: 'Company Properties',
      propertyType: 'core:company',
    },
  ],
  resolvers: {
    owner: resolveUserLabelByIdField('ownerId'),
  },
};
