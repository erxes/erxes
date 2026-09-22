import { ICompany } from '../types';

type CompanyDisplayFields = Pick<
  ICompany,
  'primaryName' | 'code' | 'primaryEmail' | 'primaryPhone'
>;

export const getCompanyDisplayName = (
  company?: CompanyDisplayFields | null,
): string | undefined => {
  if (!company) return undefined;

  const { primaryName, code, primaryEmail, primaryPhone } = company;

  return (
    primaryName?.trim() ||
    code?.trim() ||
    primaryEmail?.trim() ||
    primaryPhone?.trim() ||
    undefined
  );
};
