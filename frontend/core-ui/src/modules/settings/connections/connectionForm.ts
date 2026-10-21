import { credentialDefaults, type CredentialFormValues } from './form';
import { CONNECTION_PROVIDERS } from './providers';
import type { CredentialMetadata, CredentialTemplate } from './types';

export const connectionDefaults = (
  template?: CredentialTemplate,
  connection?: CredentialMetadata,
): CredentialFormValues => {
  const values = credentialDefaults(template, connection);
  if (!template || connection) return values;
  values.name = template.name;
  const defaults = CONNECTION_PROVIDERS[template.id]?.defaults || {};
  values.fields = values.fields.map((field) =>
    Object.prototype.hasOwnProperty.call(defaults, field.key)
      ? { ...field, action: 'replace', value: defaults[field.key] }
      : field,
  );
  return values;
};

// Review presence/actions only: never render input values, including non-password fields.
export const connectionReviewFields = (
  values: CredentialFormValues,
): { key: string; label: string; status: string }[] =>
  values.fields.map((field) => ({
    key: field.key,
    label: field.label || field.key,
    status:
      field.action === 'replace'
        ? 'Ready to save'
        : field.action === 'keep' && field.hasValue
        ? 'Saved · unchanged'
        : field.action === 'clear' && field.hasValue
        ? 'Will be removed'
        : 'Not set',
  }));
