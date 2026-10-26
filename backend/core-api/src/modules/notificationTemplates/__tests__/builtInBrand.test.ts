import { normalizeImageUrl } from '@/notificationTemplates/brand';
import { applyTemplate } from '~/utils/common';

jest.mock('erxes-api-shared/utils', () => ({
  ExpectedError: class ExpectedError extends Error {},
}));

// the full barrel pulls in every shared model; only the email content helpers are read
jest.mock('erxes-api-shared/core-modules', () =>
  jest.requireActual('erxes-api-shared/core-modules/email-content'),
);

const ERXES_LOGO = 'https://i.imgur.com/7pXtCWF.png';

const BRAND = {
  name: 'Acme',
  color: '#ff0000',
  header: '<img src="https://acme.test/logo.png" alt="Acme" />',
  footer: '<div>Acme footer</div>',
};

describe.each(['notification', 'resetPassword', 'userInvitation'])(
  'built-in %s email',
  (file) => {
    it('keeps the erxes design while no brand is set', async () => {
      const html = await applyTemplate({}, file);

      expect(html).toContain(ERXES_LOGO);
      expect(html).toContain('erxes Inc');
      expect(html).toContain('#63d2d6');
      expect(html).not.toContain('Acme');
    });

    it('is sent in the brand once one is set', async () => {
      const html = await applyTemplate({ brand: BRAND }, file);

      expect(html).toContain(BRAND.header);
      expect(html).toContain(BRAND.footer);
      expect(html).toContain('#ff0000');
      expect(html).not.toContain(ERXES_LOGO);
      expect(html).not.toContain('erxes Inc');
      expect(html).not.toContain('#63d2d6');
    });
  },
);

describe('normalizeImageUrl', () => {
  it('encodes the spaces a file name leaves in an address', () => {
    expect(
      normalizeImageUrl('https://cdn.test/a/Screenshot 2026 at 16.54.png/public'),
    ).toBe('https://cdn.test/a/Screenshot%202026%20at%2016.54.png/public');
  });

  it('leaves an encoded address as it is', () => {
    expect(normalizeImageUrl('https://cdn.test/a%20b.png?x=1&y=2')).toBe(
      'https://cdn.test/a%20b.png?x=1&y=2',
    );
  });

  it('encodes a lone percent sign instead of failing', () => {
    expect(normalizeImageUrl(' https://cdn.test/100%.png ')).toBe(
      'https://cdn.test/100%25.png',
    );
  });
});
