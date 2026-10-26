import { AGENT_MENTION_TYPES } from '../utils/mentionText';
import { readCommonLocale } from './support/agentI18n';

const en = readCommonLocale('en').agent;
const mn = readCommonLocale('mn').agent;

const placeholders = (text: unknown) =>
  typeof text === 'string' ? text.match(/{{\w+}}/g)?.sort() ?? [] : null;

const keys = [
  'mention-searching',
  'mention-unavailable',
  'mention-no-results',
  'mention-empty',
  'mention-hint',
  'mention-menu',
  'mention-limit',
  'mention-suggestions_one',
  'mention-suggestions_other',
  'attach-not-attached',
  'attach-some-not-attached',
  'attach-unavailable',
  'paste-wait-for-response',
  'drop-title',
  'drop-status',
  'drop-limit-title',
  'drop-limit-detail',
  'drop-file-count_one',
  'drop-file-count_other',
];

describe('agent composer and mention locale entries', () => {
  it.each(keys)('ships %s in English and Mongolian', (key) => {
    expect(typeof en[key]).toBe('string');
    expect(typeof mn[key]).toBe('string');
    expect(mn[key]).not.toBe(en[key]);
    expect(placeholders(mn[key])).toEqual(placeholders(en[key]));
  });

  it('labels every mention group in both locales', () => {
    const enGroups = en['mention-groups'] as Record<string, string>;
    const mnGroups = mn['mention-groups'] as Record<string, string>;
    for (const type of AGENT_MENTION_TYPES) {
      expect(enGroups?.[type]).toBeTruthy();
      expect(mnGroups?.[type]).toBeTruthy();
    }
  });
});
