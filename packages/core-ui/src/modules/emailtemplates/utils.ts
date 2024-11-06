import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';

export const generateAttributes = (
  combinedFields?: FieldsCombinedByType[],
  user?: { fullName?: string; position?: string; email?: string }
) => {
  let items: Array<{ name: string; value?: string }> = [];

  items = (combinedFields || []).map((field) => ({
    value: field.name,
    name: field.label
  }));

  items = [
    ...items,
    { name: 'User' },
    { value: user?.fullName || '', name: 'Fullname' }, // Access fullName safely
    { value: user?.position || '', name: 'Position' }, // Access position safely
    { value: user?.email || '', name: 'Email' }, // Access email safely

    { name: 'Organization' },
    { value: 'brandName', name: 'BrandName' },
    { value: 'domain', name: 'Domain' }
  ];

  return {
    items,
    title: 'Attributes',
    label: 'Attributes'
  };
};
