import { describe, expect, it } from 'vite-plus/test';
import { matchSentence, sentencePatterns } from '../pluginSentence';

describe('plugin sentences', () => {
  const patterns = sentencePatterns([
    'Order {{number}} shipped',
    'Payment {{reference}}: {{amount}} refunded',
    'Order {{number}} cancelled: {{reason}}',
    'Orders',
  ]);

  it('reads the values back from a line the plugin filled', () => {
    expect(matchSentence(patterns, 'Order #10016 shipped')).toEqual({
      key: 'Order {{number}} shipped',
      values: { number: '#10016' },
    });
    expect(matchSentence(patterns, 'Payment MANUAL-10017: ₮2,000 refunded')).toEqual({
      key: 'Payment {{reference}}: {{amount}} refunded',
      values: { reference: 'MANUAL-10017', amount: '₮2,000' },
    });
  });

  it('keeps a value with the sentence’s own words in it whole', () => {
    expect(matchSentence(patterns, 'Order #7 cancelled: shipped late: twice')?.values).toEqual({
      number: '#7',
      reason: 'shipped late: twice',
    });
  });

  it('takes the words around a slot literally, and leaves other lines alone', () => {
    expect(matchSentence(sentencePatterns(['Cart (old) {{id}}']), 'Cart (old) 5')?.values).toEqual({
      id: '5',
    });
    expect(matchSentence(patterns, 'Shipped order #1')).toBeNull();
    expect(matchSentence(patterns, 'Orders')).toBeNull();
  });
});
