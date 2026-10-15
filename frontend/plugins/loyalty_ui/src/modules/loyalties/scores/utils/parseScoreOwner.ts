import { isRecord } from '@/loyalties/utils/isRecord';
import { IScoreOwner } from '../types/score';

const text = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

export const parseScoreOwner = (value: unknown): IScoreOwner | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const details = isRecord(value.details) ? value.details : undefined;

  return {
    _id: text(value._id),
    firstName: text(value.firstName),
    middleName: text(value.middleName),
    lastName: text(value.lastName),
    primaryEmail: text(value.primaryEmail),
    primaryPhone: text(value.primaryPhone),
    email: text(value.email),
    phone: text(value.phone),
    details: details && {
      firstName: text(details.firstName),
      lastName: text(details.lastName),
      fullName: text(details.fullName),
    },
    primaryName: text(value.primaryName),
  };
};
