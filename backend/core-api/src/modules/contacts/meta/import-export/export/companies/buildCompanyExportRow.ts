import { defaultContactFieldFormatter } from '../utils';

const getFieldValue = (
  company: any,
  key: string,
  tagMap?: Map<string, string>,
  formatValue = defaultContactFieldFormatter,
): string => {
  if (key === 'tagIds') {
    const tagNames = (company.tagIds || [])
      .map((id: string) => tagMap?.get(String(id)) || id)
      .filter(Boolean);
    return formatValue(tagNames);
  }

  return formatValue(company?.[key]);
};

export const buildCompanyExportRow = (
  company: any,
  selectedFields?: string[],
  tagMap?: Map<string, string>,
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

    parentCompanyId: formatValue(company.parentCompanyId),
    ownerId: formatValue(company.ownerId),

    status: formatValue(company.status),
    businessType: formatValue(company.businessType),

    description: formatValue(company.description),
    employees: formatValue(company.employees),

    links: formatValue(company.links),

    tagIds: getFieldValue(company, 'tagIds', tagMap, formatValue),

    mergedIds: formatValue(company.mergedIds),
    code: formatValue(company.code),
    location: formatValue(company.location),

    createdAt: formatValue(company.createdAt ? new Date(company.createdAt) : ''),
    updatedAt: formatValue(company.updatedAt ? new Date(company.updatedAt) : ''),
  };

  // selectedFields mode (Field selection UI)
  if (selectedFields && selectedFields.length > 0) {
    const result: Record<string, any> = { _id: String(company._id || '') };
    selectedFields.forEach((key) => {
      result[key] = getFieldValue(company, key, tagMap, formatValue);
    });
    return result;
  }

  return allFields;
};
