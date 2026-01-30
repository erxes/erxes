import { ICompanyDocument } from 'erxes-api-shared/core-types';
import { defaultContactFieldFormatter } from '../utils';

type Maps = {
  tagMap?: Map<string, string>;
  ownerMap?: Map<string, string>;
  parentCompanyMap?: Map<string, string>;
  mergedCompanyMap?: Map<string, string>;
};

const formatDate = (value: any, formatValue: (v: any) => any) =>
  formatValue(value ? new Date(value) : '');

const getTagNames = (tagIds: string[] = [], tagMap?: Map<string, string>) => {
  return tagIds?.length
    ? tagIds
        .map((tagId: string) => tagMap?.get(String(tagId)) || tagId)
        .filter(Boolean)
        .join('; ')
    : '';
};

const getOwnerName = (ownerId?: string, ownerMap?: Map<string, string>) => {
  if (!ownerId) return '';
  return ownerMap?.get(String(ownerId)) || ownerId;
};

const getParentCompanyName = (parentCompanyId?: string, parentCompanyMap?: Map<string, string>) => {
  if (!parentCompanyId) return '';
  return parentCompanyMap?.get(String(parentCompanyId)) || parentCompanyId;
};

const getMergedCompanyNames =(mergedCompanyIds: string[] = [], mergedCompanyMap?: Map<string, string>)=>{
  return mergedCompanyIds?.length
    ? mergedCompanyIds
        .map((mergedId: string)=> mergedCompanyMap?.get(String(mergedId)) || mergedId)
        .filter(Boolean)
        .join('; ')
    : '';
}

const getFieldValue = (
  company: ICompanyDocument,
  key: string,
  maps: Maps,
  formatValue: (v: any) => any,
) => {
  if (key === 'tagIds') {
    return formatValue(getTagNames(company.tagIds || [], maps.tagMap));
  }

  if (key === 'ownerId') {
    return formatValue(getOwnerName(company.ownerId, maps.ownerMap));
  }

  if (key === 'parentCompanyId') {
    return formatValue(getParentCompanyName(company.parentCompanyId, maps.parentCompanyMap));
  }

  if( key === 'merdedId'){
    return formatValue(getMergedCompanyNames(company.mergedIds || [], maps.mergedCompanyMap));
  }

  if (key === 'createdAt' || key === 'updatedAt') {
    return formatDate(company?.[key], formatValue);
  }  
  return formatValue(company?.[key]);
};

export const buildCompanyExportRow = (
  company: ICompanyDocument,
  selectedFields?: string[],
  maps: Maps = {},
  formatter = defaultContactFieldFormatter,
): Record<string, any> => {
  const formatValue = formatter || defaultContactFieldFormatter;

  const allFields: Record<string, any> = {

    _id: formatValue(company._id),

    primaryName: formatValue(company.primaryName),
    names: formatValue(company.names),
    avatar: formatValue(company.avatar),
    primaryEmail: formatValue(company.primaryEmail),
    emails: formatValue(company.emails),
    primaryPhone: formatValue(company.primaryPhone),
    phones: formatValue(company.phones),
    website: formatValue(company.website),
    industry: formatValue(company.industry),
    size: formatValue(company.size),
    plan: formatValue(company.plan),
    status: formatValue(company.status),
    businessType: formatValue(company.businessType),
    description: formatValue(company.description),
    employees: formatValue(company.employees),
    code: formatValue(company.code),
    location: formatValue(company.location),
    links: formatValue(company.links),

    parentCompanyId: getFieldValue(company, 'parentCompanyId', maps, formatValue),
    ownerId: getFieldValue(company, 'ownerId', maps, formatValue),
    tagIds: getFieldValue(company, 'tagIds', maps, formatValue),
    mergedIds: getFieldValue(company, 'merdedId', maps, formatValue),
    createdAt: getFieldValue(company, 'createdAt', maps, formatValue),
    updatedAt: getFieldValue(company, 'updatedAt', maps, formatValue),
  };

  if (selectedFields && selectedFields.length > 0) {
    const result: Record<string, any> = {};
    selectedFields.forEach((key) => {
      result[key] = getFieldValue(company, key, maps, formatValue);
    });
    return result;
  }

  return allFields;
};
