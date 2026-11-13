import { IModels } from '~/connectionResolvers';
import { SYSTEM_EMAIL_TEMPLATES } from '@/notificationTemplates/registry';
import {
  loadSystemEmail,
  renderTemplateContent,
  validateTemplateContent,
} from '@/notificationTemplates/render';

// the full barrel pulls in every shared model; only the email content helpers are read
jest.mock('erxes-api-shared/core-modules', () =>
  jest.requireActual('erxes-api-shared/core-modules/email-content'),
);

jest.mock('erxes-api-shared/utils', () => ({
  ExpectedError: class ExpectedError extends Error {},
}));

jest.mock('@/notificationTemplates/brand', () => ({
  buildBrandValues: async () => ({
    name: 'Acme',
    header: '<img src="logo.png" />',
    footer: '<div>Footer</div>',
  }),
}));

const NOTIFICATION = SYSTEM_EMAIL_TEMPLATES['notification:default'];
const RESET = SYSTEM_EMAIL_TEMPLATES['transactional:resetPassword'];

const FRAME = (body: string) =>
  `{{ brand.header }}${body}{{ brand.footer }}`;

describe('validateTemplateContent', () => {
  it('accepts a body with its required fields inside the brand frame', () => {
    expect(() =>
      validateTemplateContent(RESET, {
        subject: 'Reset',
        content: FRAME('<a href="{{ link }}">Reset</a>'),
      }),
    ).not.toThrow();
  });

  it('refuses an empty body', () => {
    expect(() => validateTemplateContent(RESET, { content: ' ' })).toThrow(
      'The email has no content',
    );
  });

  it('names a field the template does not declare', () => {
    expect(() =>
      validateTemplateContent(RESET, {
        subject: 'Hi {{ firstName }}',
        content: FRAME('{{ link }}'),
      }),
    ).toThrow('Unknown fields: {{ firstName }}');
  });

  it('names a required field that was removed', () => {
    expect(() =>
      validateTemplateContent(RESET, { content: FRAME('No link here') }),
    ).toThrow('Required fields missing: Reset link');
  });

  it('keeps the brand footer in every template', () => {
    expect(() =>
      validateTemplateContent(RESET, { content: '{{ brand.header }}{{ link }}' }),
    ).toThrow('Required fields missing: Brand footer');
  });
});

describe('renderTemplateContent', () => {
  const values = {
    notification: {
      title: 'Tom & Jerry',
      content: '<p>Rendered</p>',
      message: '<b>assigned</b>',
      link: 'https://example.com/x',
    },
  };

  it('escapes plain fields and keeps html fields as written', async () => {
    const { html } = await renderTemplateContent({
      definition: NOTIFICATION,
      content: {
        content:
          '{{ notification.message }}|{{ notification.content }}|{{ notification.title }}',
      },
      values,
    });

    expect(html).toBe(
      '&lt;b&gt;assigned&lt;/b&gt;|<p>Rendered</p>|Tom &amp; Jerry',
    );
  });

  it('fills the subject without escaping it', async () => {
    const { subject } = await renderTemplateContent({
      definition: NOTIFICATION,
      content: { content: 'x' },
      values,
    });

    expect(subject).toBe('Tom & Jerry');
  });

  it('leaves a field outside the contract unresolved', async () => {
    const { unresolved } = await renderTemplateContent({
      definition: NOTIFICATION,
      content: { content: '{{ customer.firstName }}' },
      values,
    });

    expect(unresolved).toEqual(['customer.firstName']);
  });

  it('uses a fallback for an empty field', async () => {
    const { html } = await renderTemplateContent({
      definition: NOTIFICATION,
      content: { content: '{{ actor.name | Someone }}' },
      values,
    });

    expect(html).toBe('Someone');
  });
});

describe('loadSystemEmail', () => {
  const buildModels = (published?: { content: string; subject?: string }) => {
    const recordFallback = jest.fn().mockResolvedValue(undefined);

    const models = {
      NotificationTemplates: {
        findOne: () => ({ lean: async () => (published ? { published } : null) }),
        recordFallback,
      },
    } as unknown as IModels;

    return { models, recordFallback };
  };

  const data = {
    action: 'assigned you',
    userName: 'Bat',
    notification: { title: 'Task', link: 'https://example.com/n/1' },
  };

  it('leaves a file nobody customized to the built-in', async () => {
    const { models } = buildModels();

    expect(await loadSystemEmail(models, 'os', 'notification')).toBeNull();
  });

  it('never replaces a file that is not editable', async () => {
    const { models } = buildModels({ content: 'x' });

    expect(await loadSystemEmail(models, 'os', 'senderConfirmation')).toBeNull();
  });

  it('renders the published template inside the brand frame', async () => {
    const { models } = buildModels({
      content: FRAME('{{ actor.name }} {{ notification.message }}'),
      subject: 'New: {{ notification.title }}',
    });

    const email = await loadSystemEmail(models, 'os', 'notification');

    expect(await email?.render(data)).toEqual({
      html: '<img src="logo.png" />Bat assigned you<div>Footer</div>',
      subject: 'New: Task',
    });
  });

  it('falls back and records why when a field cannot be filled', async () => {
    const { models, recordFallback } = buildModels({
      content: FRAME('{{ customer.firstName }}'),
    });

    const email = await loadSystemEmail(models, 'os', 'notification');

    expect(await email?.render(data)).toBeNull();
    expect(recordFallback).toHaveBeenCalledWith(
      'notification:default',
      'unresolved placeholder: {{ customer.firstName }}',
    );
  });
});
