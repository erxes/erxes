// @vitest-environment happy-dom
import { describe, expect, it } from 'vite-plus/test';
import { actUntil, setupDomRender } from '../../lib/render-in-dom';
import { PhoneDisplay } from '../../modules/display/components/PhoneDisplay';
import { formatPhoneNumber, loadPhoneFormatter } from './formatPhoneNumber';

const render = setupDomRender();

describe('formatPhoneNumber', () => {
  it('shows a phone as stored, then formatted once the library loads', async () => {
    const container = render(<PhoneDisplay primaryPhone="+97699112233" phones={[]} />);

    expect(container.textContent).toBe('+97699112233');

    await actUntil(() => container.textContent === '+976 9911 2233');
    expect(container.textContent).toBe('+976 9911 2233');
  });

  it('formats in full after loadPhoneFormatter resolves', async () => {
    await loadPhoneFormatter();

    expect(formatPhoneNumber({ value: '+14155550123' })).toBe('+1 415 555 0123');
    expect(formatPhoneNumber({ value: '99112233', defaultCountry: 'MN' })).toBe('9911 2233');
  });
});
