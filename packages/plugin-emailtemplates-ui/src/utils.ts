import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';

export const generateAttributes = (combinedFields?: FieldsCombinedByType[]) => {
  let items: Array<{ name: string; value?: string }> = [];

  items = (combinedFields || []).map((field) => ({
    value: field.name,
    name: field.label,
  }));

  items = [
    ...items,
    { name: 'User' },
    { value: 'user' ? 'user.fullName' : '', name: 'Fullname' },
    { value: 'user' ? 'user.position' : '', name: 'Position' },
    { value: 'user' ? 'user.email' : '', name: 'Email' },
    { name: 'Organization' },
    { value: 'brandName', name: 'BrandName' },
    { value: 'domain', name: 'Domain' },
  ];

  return {
    items,
    title: 'Attributes',
    label: 'Attributes',
  };
};
