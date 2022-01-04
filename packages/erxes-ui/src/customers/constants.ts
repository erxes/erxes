import { getConstantFromStore } from '../utils';

export const LEAD_STATUS_TYPES = {
  new: 'New',
  attemptedToContact: 'Contacted',
  inProgress: 'Working',
  badTiming: 'Bad Timing',
  unqualified: 'Unqualified'
};

export const GENDER_TYPES = () => getConstantFromStore('sex_choices', true);

export const EMAIL_VALIDATION_STATUSES = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Disposable', value: 'disposable' },
  { label: 'Catchall', value: 'catchall' },
  { label: 'Bad syntax', value: 'badsyntax' },
  { label: 'Unverifiable', value: 'unverifiable' },
  { label: 'Not checked', value: 'Not checked' }
];

export const PHONE_VALIDATION_STATUSES = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Unverifiable', value: 'unverifiable' },
  { label: 'Mobile phone', value: 'receives_sms' }
];
