import { matchesTelegramTrigger } from '@/integrations/telegram/meta/automation/workers';

describe('matchesTelegramTrigger', () => {
  const privateMessage = { chatType: 'private' as const, content: 'Hello' };

  it('answers private chats only by default', () => {
    expect(matchesTelegramTrigger(privateMessage)).toBe(true);
    expect(
      matchesTelegramTrigger({ chatType: 'group', content: 'Hello' }),
    ).toBe(false);
  });

  it('includes groups when asked', () => {
    expect(
      matchesTelegramTrigger(
        { chatType: 'supergroup', content: 'Hello' },
        { chatTypes: 'all' },
      ),
    ).toBe(true);
  });

  it('filters by comma-separated keywords, ignoring case', () => {
    expect(
      matchesTelegramTrigger(
        { chatType: 'private', content: 'Захиалга хаана явна?' },
        { keywords: 'үнэ, захиалга' },
      ),
    ).toBe(true);
    expect(
      matchesTelegramTrigger(privateMessage, { keywords: 'price, order' }),
    ).toBe(false);
  });
});
