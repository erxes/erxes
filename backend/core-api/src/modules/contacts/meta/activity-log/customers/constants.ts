export const CUSTOMER_PRONOUN_LABELS: Record<string, string> = {
  '1': 'male',
  '2': 'female',
};

export const CUSTOMER_ACTIVITY_FIELDS = [
  { field: 'firstName', label: 'First Name' },
  { field: 'lastName', label: 'Last Name' },
  { field: 'middleName', label: 'Middle Name' },
  { field: 'primaryEmail', label: 'Primary Email' },
  { field: 'primaryPhone', label: 'Primary Phone' },
  { field: 'birthDate', label: 'Birth Date' },
  { field: 'position', label: 'Position' },
  { field: 'department', label: 'Department' },
  { field: 'leadStatus', label: 'Lead Status' },
  { field: 'hasAuthority', label: 'Has Authority' },
  { field: 'description', label: 'Description' },
  { field: 'doNotDisturb', label: 'Do Not Disturb' },
  { field: 'isSubscribed', label: 'Subscription Status' },
  { field: 'emailValidationStatus', label: 'Email Validation Status' },
  { field: 'phoneValidationStatus', label: 'Phone Validation Status' },
  { field: 'status', label: 'Status' },
  { field: 'code', label: 'Code' },
  { field: 'state', label: 'State' },
] as const;
