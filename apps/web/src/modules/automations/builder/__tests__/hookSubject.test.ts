import { describe, expect, it } from 'vite-plus/test';
import { subjectFieldLabel, subjectOf, withSubjectBy } from '../WebhookTriggerSettings';

describe('hook and app trigger subject helpers', () => {
  it('switches find-by keys for app triggers with bare event field names', () => {
    expect(
      withSubjectBy(
        'app',
        { type: 'customer', by: 'primaryEmail', field: 'email' },
        'primaryPhone',
      ),
    ).toEqual({ type: 'customer', by: 'primaryPhone', field: 'email' });

    expect(
      withSubjectBy('app', { type: 'customer', by: 'primaryEmail', field: 'customer.id' }, 'id'),
    ).toEqual({ type: 'customer', by: 'id', field: 'customer.id' });

    expect(
      withSubjectBy('webhook', { type: 'customer', by: 'primaryEmail', field: 'body.email' }, 'id'),
    ).toEqual({ type: 'customer', by: 'id', field: 'body.email' });

    expect(
      withSubjectBy('webhook', { type: 'customer', by: 'primaryEmail', field: 'email' }, 'id'),
    ).toBeNull();
  });

  it('uses unprefixed fallback fields for app triggers and body.* for webhooks', () => {
    expect(subjectOf('customer', [], 'app')).toEqual({
      type: 'customer',
      by: 'primaryEmail',
      field: 'email',
    });
    expect(subjectOf('company', [], 'app')).toEqual({
      type: 'company',
      by: 'primaryName',
      field: 'company',
    });
    expect(subjectOf('customer', [], 'webhook')).toEqual({
      type: 'customer',
      by: 'primaryEmail',
      field: 'body.email',
    });
  });

  it('formats fallback labels for both webhook and app fields', () => {
    expect(subjectFieldLabel('email')).toBe('email');
    expect(subjectFieldLabel('customer.email')).toBe('customer email');
    expect(subjectFieldLabel('body.email')).toBe('email');
    expect(subjectFieldLabel('query.customer.id')).toBe('customer id');
  });
});
