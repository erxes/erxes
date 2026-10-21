import {
  credentialDefaults,
  credentialFormSchema,
  credentialGrantSchema,
  credentialInput,
  credentialValueAction,
  newCustomField,
} from '../form';
import { CredentialMetadata, CredentialTemplate } from '../types';

const template: CredentialTemplate = {
  id: 'ai-api-key',
  name: 'AI API key',
  category: 'ai',
  fields: [
    {
      key: 'apiKey',
      label: 'API key',
      type: 'password',
      secret: true,
      required: true,
    },
  ],
};
const credential: CredentialMetadata = {
  _id: 'credential-id',
  reference: 'stable-reference',
  name: 'Production',
  description: '',
  templateId: template.id,
  category: template.category,
  createdAt: '2026-10-20T00:00:00Z',
  updatedAt: '2026-10-20T00:00:00Z',
  fields: [{ ...template.fields[0], hasValue: true }],
};

describe('credential forms', () => {
  it('maps inline value entry to replace, optional empty, or unchanged without placeholders', () => {
    const required = { existing: false, required: true };
    const optional = { existing: false, required: false };
    const stored = { existing: true, required: false };
    expect(credentialValueAction(required, '')).toBe('replace');
    expect(credentialValueAction(optional, '')).toBe('clear');
    expect(credentialValueAction(stored, '')).toBe('keep');
    expect(credentialValueAction({ existing: true, required: true }, '')).toBe(
      'keep',
    );
    for (const field of [required, optional, stored]) {
      expect(credentialValueAction(field, 'test-only-value')).toBe('replace');
      expect(credentialValueAction(field, 'false')).toBe('replace');
      expect(credentialValueAction(field, '0')).toBe('replace');
      expect(credentialValueAction(field, ' ')).toBe('replace');
    }
  });

  it('omits a replacement discarded by erasing inline entry on an existing field', () => {
    const defaults = credentialDefaults(template, credential);
    const field = defaults.fields[0];
    field.value = 'test-only-value';
    field.action = credentialValueAction(field, field.value);
    expect(credentialInput(defaults).fields[0].value).toBe('test-only-value');
    field.value = '';
    field.action = credentialValueAction(field, field.value);
    expect(credentialFormSchema.safeParse(defaults).success).toBe(true);
    expect(credentialInput(defaults).fields[0]).toMatchObject({
      action: 'keep',
    });
    expect(credentialInput(defaults).fields[0]).not.toHaveProperty('value');
  });

  it('creates edit defaults from metadata only, without saved-value placeholders', () => {
    const defaults = credentialDefaults(template, credential);
    expect(defaults.fields[0]).toMatchObject({
      action: 'keep',
      value: '',
      hasValue: true,
      existing: true,
    });
    expect(credentialFormSchema.safeParse(defaults).success).toBe(true);
    expect(credentialInput(defaults).fields[0]).not.toHaveProperty('value');
    expect(credentialInput(defaults)).not.toHaveProperty('reference');
  });

  it('requires a name and replacement values on create', () => {
    const defaults = credentialDefaults(template);
    expect(credentialFormSchema.safeParse(defaults).success).toBe(false);
    defaults.name = 'Production';
    defaults.fields[0].value = 'new-secret';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(true);
    expect(credentialInput(defaults).fields[0]).toMatchObject({
      action: 'replace',
      value: 'new-secret',
    });
  });

  it('starts optional template fields empty without submitting placeholder values', () => {
    const defaults = credentialDefaults({
      ...template,
      fields: [
        ...template.fields,
        {
          key: 'endpoint',
          label: 'Endpoint',
          type: 'url',
          secret: false,
          required: false,
        },
      ],
    });
    defaults.name = 'Optional endpoint';
    defaults.fields[0].value = 'test-only-value';
    expect(defaults.fields[1].action).toBe('clear');
    expect(credentialFormSchema.safeParse(defaults).success).toBe(true);
    expect(credentialInput(defaults).fields[1]).not.toHaveProperty('value');
  });

  it('rejects invalid metadata and null characters before sending a mutation', () => {
    const defaults = credentialDefaults(template, credential);
    defaults.description = 'line\nbreak';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(false);
    defaults.description = '';
    defaults.fields[0].value = 'test\u0000value';
    defaults.fields[0].action = 'replace';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(false);
    expect(
      credentialGrantSchema.safeParse({
        pluginName: 'worker',
        name: 'line\nbreak',
      }).success,
    ).toBe(false);
  });

  it('rejects clear for required fields and keep for new fields', () => {
    const defaults = credentialDefaults(template, credential);
    defaults.fields[0].action = 'clear';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(false);
    defaults.fields[0].action = 'keep';
    defaults.fields[0].existing = false;
    expect(credentialFormSchema.safeParse(defaults).success).toBe(false);
  });

  it('never includes an old replacement value when keeping or clearing', () => {
    const defaults = credentialDefaults(template, credential);
    defaults.fields[0].value = 'discard-me';
    expect(credentialInput(defaults).fields[0]).not.toHaveProperty('value');
    defaults.fields[0].required = false;
    defaults.fields[0].action = 'clear';
    expect(credentialInput(defaults).fields[0]).toMatchObject({
      action: 'clear',
    });
    expect(credentialInput(defaults).fields[0]).not.toHaveProperty('value');
  });

  it('supports multiple generic fields and extensible categories', () => {
    const values = {
      name: 'Custom service',
      description: '',
      templateId: 'generic',
      category: 'future-service',
      fields: [
        { ...newCustomField(), key: 'first', value: 'one' },
        { ...newCustomField(), key: 'second', value: 'two' },
      ],
    };
    expect(credentialFormSchema.safeParse(values).success).toBe(true);
    expect(credentialInput(values).fields[0].label).toBe('first');
    values.fields[1].key = 'first';
    expect(credentialFormSchema.safeParse(values).success).toBe(false);
    values.fields[1].key = 'constructor';
    expect(credentialFormSchema.safeParse(values).success).toBe(false);
  });

  it('validates number, boolean and safe HTTP URL values', () => {
    const defaults = credentialDefaults(template, credential);
    const field = defaults.fields[0];
    field.action = 'replace';
    field.type = 'number';
    field.value = 'not-a-number';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(false);
    field.value = '587';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(true);
    field.type = 'boolean';
    field.value = 'yes';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(false);
    field.value = 'false';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(true);
    field.type = 'url';
    field.value = 'https://user:password@example.com';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(false);
    field.value = 'https://example.com/api';
    expect(credentialFormSchema.safeParse(defaults).success).toBe(true);
  });

  it('requires plugin identity and a grant name', () => {
    expect(
      credentialGrantSchema.safeParse({ pluginName: '', name: '' }).success,
    ).toBe(false);
    expect(
      credentialGrantSchema.safeParse({
        pluginName: 'worker',
        name: 'Production worker',
      }).success,
    ).toBe(true);
  });

  it('uses the backend plugin identity constraint', () => {
    const parse = (pluginName: string) =>
      credentialGrantSchema.safeParse({ pluginName, name: 'Test consumer' })
        .success;
    expect(parse('worker-1')).toBe(true);
    expect(parse('a'.repeat(64))).toBe(true);
    for (const name of ['Worker', 'worker_name', '1worker', 'a'.repeat(65)]) {
      expect(parse(name)).toBe(false);
    }
  });
});
