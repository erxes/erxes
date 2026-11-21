import type {
  DataExtensionField,
  DataExtensionFieldSettings,
  DataExtensionFieldType,
  DataExtensionOption,
} from '@erxes/core-contract';

/** A field being added or changed in the field sheet. */
export interface FieldDraft {
  key: string;
  label: string;
  description: string;
  icon: string | null;
  type: DataExtensionFieldType;
  options: DataExtensionOption[];
  settings: DataExtensionFieldSettings;
}

export type SetDraft = (patch: Partial<FieldDraft>) => void;

/** Changes some settings, dropping the ones set to undefined. */
export type SetSettings = (patch: Partial<DataExtensionFieldSettings>) => void;

export const newDraft = (): FieldDraft => ({
  key: '',
  label: '',
  description: '',
  icon: null,
  type: 'text',
  options: [],
  settings: {},
});

export const draftOf = (field: DataExtensionField): FieldDraft => ({
  key: field.key,
  label: field.label,
  description: field.description ?? '',
  icon: field.icon,
  type: field.type,
  options: field.options,
  settings: field.settings,
});

/** `Lost reason` → `lostReason`: what a new field's key starts as. */
export const keyOfLabel = (label: string) => {
  const [first = '', ...rest] = label
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .trim()
    .split(/\s+/);

  const key = [
    first.toLowerCase(),
    ...rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()),
  ]
    .join('')
    .replace(/^[^a-z]+/, '');

  return key.slice(0, 30);
};

/**
 * The draft's options and settings as the API takes them. Settings are replaced whole, and an
 * unset one is undefined, which JSON leaves out.
 */
export const draftBody = (draft: FieldDraft) => ({
  label: draft.label,
  options: draft.type === 'select' || draft.type === 'multiSelect' ? draft.options : undefined,
  settings: draft.settings,
});
