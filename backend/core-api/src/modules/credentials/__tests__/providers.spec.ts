import { credentialTemplates } from '../templates';
import { prepareCredential } from '../validation';

describe('connection provider contracts', () => {
  it('rejects invalid SMTP port numbers instead of storing unusable configuration', () => {
    const input = (port: string) => ({
      name: 'SMTP connection',
      templateId: 'smtp',
      category: 'email',
      fields: [
        { key: 'host', action: 'replace', value: 'smtp.example.invalid' },
        { key: 'port', action: 'replace', value: port },
        { key: 'username', action: 'replace', value: 'synthetic-user' },
        { key: 'password', action: 'replace', value: 'synthetic-password' },
      ],
    });
    for (const port of ['0', '65536', '587.5', '-1'])
      expect(() => prepareCredential(input(port))).toThrow(
        'Invalid credential input',
      );
    expect(prepareCredential(input('587')).values.port).toBe('587');
  });
  const providers = [
    'openai',
    'grok',
    'kimi',
    'kimi-code',
    'cloudflare-ai-gateway',
    'cloudflare-r2',
    'amazon-ses',
    'sendgrid',
    'smtp',
    's3',
  ];

  it('has unique provider ids while retaining legacy consumer contracts', () => {
    expect(
      new Set(credentialTemplates.map((template) => template.id)).size,
    ).toBe(credentialTemplates.length);
    for (const id of [...providers, 'generic', 'ai-api-key'])
      expect(credentialTemplates.some((template) => template.id === id)).toBe(
        true,
      );
  });

  it.each(providers)(
    'enforces the %s field contract, required fields, and sensitive descriptors',
    (id) => {
      const template = credentialTemplates.find((item) => item.id === id);
      if (!template) throw new Error('Test provider missing');
      const fields = template.fields
        .filter((field) => field.required)
        .map((field) => ({
          key: field.key,
          action: 'replace',
          type: 'text',
          secret: false,
          value: field.type === 'number' ? '587' : 'synthetic-test-only-value',
        }));
      const input = {
        name: 'Test connection',
        templateId: id,
        category: template.category,
        fields,
      };
      const prepared = prepareCredential(input);
      expect(prepared.templateId).toBe(id);
      for (const field of template.fields.filter(
        (descriptor) => descriptor.secret,
      )) {
        expect(
          prepared.fields.find((descriptor) => descriptor.key === field.key)
            ?.secret,
        ).toBe(true);
      }
      expect(() =>
        prepareCredential({ ...input, fields: fields.slice(1) }),
      ).toThrow('Invalid credential input');
      expect(() =>
        prepareCredential({
          ...input,
          fields: [
            ...fields,
            {
              key: 'arbitraryUserKey',
              action: 'replace',
              value: 'synthetic-only',
            },
          ],
        }),
      ).toThrow('Invalid credential input');
    },
  );
});
