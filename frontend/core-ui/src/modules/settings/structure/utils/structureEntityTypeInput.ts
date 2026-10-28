import {
  IStructureEntityTypeDetail,
  IStructureEntityTypeForm,
  IStructureEntityTypeVariables,
} from '../types/structureEntity';

const FALLBACK_TYPE_CODE = 'type';

export const toStructureEntityTypeFormValues = (
  type: IStructureEntityTypeDetail,
): IStructureEntityTypeForm => ({
  name: type.name,
  icon: type.icon ?? '',
  parentTypeIds: type.parentTypeIds ?? [],
  legacyKind: type.legacyKind ?? 'none',
  capabilities: type.capabilities ?? [],
});

export const toStructureEntityTypeVariables = (
  values: IStructureEntityTypeForm,
  isSystem: boolean,
): IStructureEntityTypeVariables => {
  const variables: IStructureEntityTypeVariables = {
    name: values.name.trim(),
    icon: values.icon,
    capabilities: values.capabilities,
  };

  if (isSystem) {
    return variables;
  }

  return {
    ...variables,
    parentTypeIds: values.parentTypeIds,
    legacyKind: values.legacyKind === 'none' ? null : values.legacyKind,
  };
};

export const toStructureTypeCode = (name: string, existingCodes: string[]) => {
  const base =
    name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .join('-') || FALLBACK_TYPE_CODE;

  if (!existingCodes.includes(base)) {
    return base;
  }

  let suffix = 2;

  while (existingCodes.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
};

export const toStructureNewTypeVariables = (
  name: string,
  existingCodes: string[],
): IStructureEntityTypeVariables => ({
  name: name.trim(),
  code: toStructureTypeCode(name, existingCodes),
  icon: '',
  capabilities: [],
});
