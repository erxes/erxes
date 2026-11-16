import * as jwt from 'jsonwebtoken';
import {
  readFormLink,
  readFormLinkDays,
  signFormLink,
} from '@/form/formLink';
import { recordTypeOf } from '@/form/meta/automation/createFormLinkAction';

const link = {
  linkId: 'link-1',
  formId: 'form-1',
  customerId: 'customer-1',
  aboutRecord: { type: 'frontline:tickets.tickets', id: 'ticket-1' },
};

describe('form links', () => {
  it('reads back what it signed', () => {
    expect(readFormLink(signFormLink(link, 30), 'form-1')).toEqual(link);
  });

  it('refuses a token made for another form', () => {
    expect(readFormLink(signFormLink(link, 30), 'form-2')).toBeNull();
  });

  it('refuses a forged token', () => {
    const forged = jwt.sign(link, 'other-secret', { audience: 'erxes-form-link' });

    expect(readFormLink(forged, 'form-1')).toBeNull();
  });

  it('refuses an expired token', () => {
    const now = Date.now();
    const spy = jest.spyOn(Date, 'now').mockReturnValue(now);
    const token = signFormLink(link, 1);

    spy.mockReturnValue(now + 2 * 24 * 60 * 60 * 1000);
    expect(readFormLink(token, 'form-1')).toBeNull();
    spy.mockRestore();
  });

  it('defaults and caps the lifetime', () => {
    expect(readFormLinkDays(undefined)).toBe(30);
    expect(readFormLinkDays('')).toBe(30);
    expect(readFormLinkDays('-4')).toBe(30);
    expect(readFormLinkDays('7')).toBe(7);
    expect(readFormLinkDays(5000)).toBe(365);
  });

  it('drops the relation from a trigger type', () => {
    expect(recordTypeOf('frontline:tickets.tickets.sla')).toBe(
      'frontline:tickets.tickets',
    );
    expect(recordTypeOf('frontline:tickets.tickets')).toBe(
      'frontline:tickets.tickets',
    );
    expect(recordTypeOf(undefined)).toBeUndefined();
  });
});
