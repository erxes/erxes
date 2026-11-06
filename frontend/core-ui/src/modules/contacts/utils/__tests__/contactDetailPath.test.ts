import {
  getContactDetailPath,
  getContactListPath,
  isContactContentType,
} from '../contactDetailPath';

jest.mock(
  '@/types/paths/ContactsPath',
  () => ({
    ContactsPath: {
      Index: '/contacts',
      Customers: '/customers',
      Leads: '/leads',
      Companies: '/companies',
    },
  }),
  { virtual: true },
);

describe('contact detail paths', () => {
  it('recognizes only contact records', () => {
    expect(isContactContentType('core:customer')).toBe(true);
    expect(isContactContentType('core:company')).toBe(true);
    expect(isContactContentType('operation:task')).toBe(false);
  });

  it('opens a customer under customers from any other page', () => {
    expect(getContactDetailPath('core:customer', 'a1', '/operation/tasks')).toBe(
      '/contacts/customers/a1',
    );
  });

  it('keeps a customer opened among leads under leads', () => {
    expect(getContactDetailPath('core:customer', 'a1', '/contacts/leads')).toBe(
      '/contacts/leads/a1',
    );
    expect(getContactListPath('core:customer', '/contacts/leads/a1')).toBe(
      '/contacts/leads',
    );
  });

  it('does not mistake a similar path for leads', () => {
    expect(getContactListPath('core:customer', '/contacts/leads-old')).toBe(
      '/contacts/customers',
    );
  });

  it('opens a company under companies', () => {
    expect(getContactDetailPath('core:company', 'c/1', '/contacts/leads')).toBe(
      '/contacts/companies/c%2F1',
    );
  });
});
