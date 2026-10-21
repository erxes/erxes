import { connectionDefaults, connectionReviewFields } from '../connectionForm';
import { credentialFormSchema, credentialInput } from '../form';
import { CONNECTION_PROVIDERS, connectionIsConfigured } from '../providers';
import { savedConnection, templates } from './fixtures';

describe('provider-specific connection setup', () => {
  it('validates SMTP port bounds before review', () => {
    const values = connectionDefaults(templates[1]);
    values.fields = values.fields.map((field) =>
      field.required
        ? { ...field, value: field.key === 'port' ? '587' : 'synthetic-value' }
        : field,
    );
    expect(credentialFormSchema.safeParse(values).success).toBe(true);
    const port = values.fields.find((field) => field.key === 'port');
    if (!port) throw new Error('Test SMTP port missing');
    for (const invalid of ['0', '65536', '587.5', '-1']) {
      port.value = invalid;
      expect(credentialFormSchema.safeParse(values).success).toBe(false);
    }
  });
  it('prefills only public creation defaults and leaves new secret inputs blank', () => {
    const openai = connectionDefaults(templates[0]);
    expect(openai.name).toBe('OpenAI');
    expect(openai.fields[0].value).toBe('');
    expect(
      openai.fields.find((field) => field.key === 'baseUrl'),
    ).toMatchObject({ action: 'replace', value: 'https://api.openai.com/v1' });
    expect(credentialFormSchema.safeParse(openai).success).toBe(false);
    openai.fields[0].value = 'synthetic-only-secret';
    expect(credentialFormSchema.safeParse(openai).success).toBe(true);
    expect(credentialInput(openai).fields[0]).toMatchObject({
      key: 'apiKey',
      action: 'replace',
    });
  });

  it('does not silently replace saved endpoints when editing', () => {
    const edit = connectionDefaults(templates[0], savedConnection);
    expect(
      edit.fields.every(
        (field) => field.value === '' && field.action === 'keep',
      ),
    ).toBe(true);
    expect(credentialFormSchema.safeParse(edit).success).toBe(true);
    expect(
      credentialInput(edit).fields.every((field) => !('value' in field)),
    ).toBe(true);
  });

  it('keeps input values out of the review, including non-secret fields', () => {
    const values = connectionDefaults(templates[0]);
    values.fields[0].value = 'synthetic-only-secret';
    const review = JSON.stringify(connectionReviewFields(values));
    expect(review).not.toContain('synthetic-only-secret');
    expect(review).not.toContain('https://api.openai.com');
    expect(review).toContain('Ready to save');
    expect(review).toContain('Not set');
  });

  it('offers only HTTPS provider guides and local logos', () => {
    for (const provider of Object.values(CONNECTION_PROVIDERS)) {
      expect(new URL(provider.docs).protocol).toBe('https:');
      if (provider.logo)
        expect(provider.logo.startsWith('/assets/')).toBe(true);
    }
  });

  it('derives configured from required field presence without claiming network verification', () => {
    expect(connectionIsConfigured(savedConnection)).toBe(true);
    expect(
      connectionIsConfigured({
        ...savedConnection,
        fields: [{ ...savedConnection.fields[0], hasValue: false }],
      }),
    ).toBe(false);
    expect(connectionIsConfigured({ ...savedConnection, fields: [] })).toBe(
      false,
    );
  });
});
