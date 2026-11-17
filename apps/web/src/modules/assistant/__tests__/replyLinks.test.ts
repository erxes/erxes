import { describe, expect, it } from 'vite-plus/test';
import { replyLink } from '../replyLinks';

describe('replyLink', () => {
  it('keeps web, mail and in-app links', () => {
    expect(replyLink('https://erxes.io/docs')).toBe('https://erxes.io/docs');
    expect(replyLink('http://example.com')).toBe('http://example.com');
    expect(replyLink('mailto:ada@example.com')).toBe('mailto:ada@example.com');
    expect(replyLink('/contacts/customers?id=abc')).toBe('/contacts/customers?id=abc');
  });

  it('drops links that run code or leave through another scheme', () => {
    expect(replyLink('javascript:alert(1)')).toBeNull();
    expect(replyLink(' JavaScript:alert(1)')).toBeNull();
    expect(replyLink('data:text/html;base64,PHNjcmlwdD4=')).toBeNull();
    expect(replyLink('//evil.example/x')).toBeNull();
  });
});
