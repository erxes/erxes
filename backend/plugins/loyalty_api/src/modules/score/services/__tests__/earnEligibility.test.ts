import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { isInSegment } from '~/utils/utils';
import { earnEligibilityIssue, mayEarn } from '../earnEligibility';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('~/utils/utils', () => ({ isInSegment: jest.fn() }));

const ask = (
  eligibility: Parameters<typeof mayEarn>[0]['eligibility'],
  ownerType = 'customer',
) =>
  mayEarn({ subdomain: 'test', eligibility, ownerType, ownerId: 'customer-a' });

beforeEach(() => {
  (sendTRPCMessage as jest.Mock).mockReset();
  (isInSegment as jest.Mock).mockReset();
});

describe('mayEarn', () => {
  it('lets everyone earn when the wallet says nothing or everyone', async () => {
    expect(await ask(undefined)).toBe(true);
    expect(await ask({ who: 'all' })).toBe(true);
  });

  it('lets a customer with a client portal account earn', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue({ _id: 'cp-user' });

    expect(await ask({ who: 'clientPortal' })).toBe(true);
    expect(sendTRPCMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'cpUsers',
        input: { erxesCustomerId: 'customer-a' },
      }),
    );
  });

  it('keeps a customer without a client portal account from earning', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue(null);

    expect(await ask({ who: 'clientPortal' })).toBe(false);
  });

  it('lets segment members earn and keeps everyone else out', async () => {
    (isInSegment as jest.Mock).mockResolvedValueOnce(true);
    expect(await ask({ who: 'segment', segmentId: 'vip' })).toBe(true);

    (isInSegment as jest.Mock).mockResolvedValueOnce(false);
    expect(await ask({ who: 'segment', segmentId: 'vip' })).toBe(false);
  });

  it('keeps everyone out of a segment rule with no segment', async () => {
    expect(await ask({ who: 'segment' })).toBe(false);
    expect(isInSegment).not.toHaveBeenCalled();
  });
});

describe('earnEligibilityIssue', () => {
  it('accepts every complete setting', () => {
    expect(earnEligibilityIssue(undefined, 'customer')).toBeNull();
    expect(earnEligibilityIssue({ who: 'all' }, 'user')).toBeNull();
    expect(
      earnEligibilityIssue({ who: 'clientPortal' }, 'customer'),
    ).toBeNull();
    expect(
      earnEligibilityIssue({ who: 'segment', segmentId: 'vip' }, 'company'),
    ).toBeNull();
  });

  it('allows a client portal rule only on a customer wallet', () => {
    expect(earnEligibilityIssue({ who: 'clientPortal' }, 'company')).toMatch(
      /customer wallet/,
    );
  });

  it('needs a segment for a segment rule', () => {
    expect(earnEligibilityIssue({ who: 'segment' }, 'customer')).toMatch(
      /segment/,
    );
  });
});
