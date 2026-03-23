import { ICompanyDocument } from 'erxes-api-shared/core-types';
import { COMPANY_ACTIVITY_FIELDS } from './constants';

export const getCompanyFieldLabel = (field: string) => {
  if (field.startsWith('links.')) {
    const [, key] = field.split('.');
    return `${key} link`;
  }

  const match = COMPANY_ACTIVITY_FIELDS.find((item) => item.field === field);
  return match?.label || field;
};

export const getCompanyDisplayText = (doc: Partial<ICompanyDocument>) =>
  doc.primaryName ||
  doc.primaryEmail ||
  doc.primaryPhone ||
  (doc._id ? `Company ${doc._id}` : 'this company');

export const buildCompanyTarget = (company: ICompanyDocument | { _id: string }) => ({
  _id: company._id,
  moduleName: 'contacts',
  collectionName: 'companies',
  text: getCompanyDisplayText(company as ICompanyDocument),
});
