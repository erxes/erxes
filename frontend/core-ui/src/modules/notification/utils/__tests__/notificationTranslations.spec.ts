import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inboxKeys = [
  'select-notification-label',
  'select-visible',
  'notification-count_one',
  'notification-count_other',
  'conversation-count_one',
  'conversation-count_other',
  'keyboard-shortcuts',
  'shortcut-navigate',
  'shortcut-range',
  'shortcut-toggle',
  'shortcut-toggle-keys',
  'shortcut-action',
  'all-caught-up',
  'no-filter-matches',
  'clear-filters',
  'view-all',
  'plugin',
  'no-priority',
  'minor',
  'medium',
  'high',
  'critical',
  'info',
  'success',
  'warning',
  'error',
];

describe.each(['en', 'mn'])('%s inbox translations', (language) => {
  it('defines inbox labels inside the notification namespace', () => {
    const path = resolve(
      __dirname,
      '../../../../../../../backend/gateway/src/locales',
      language,
      'common.json',
    );
    const dictionary: unknown = JSON.parse(readFileSync(path, 'utf8'));
    for (const key of inboxKeys) {
      expect(dictionary).toHaveProperty(
        `notification.${key}`,
        expect.any(String),
      );
    }
  });
});
