import {
  buildFailedAction,
  buildSkippedAction,
  isActionOutcomeEnvelope,
  resolveActionOutcome,
} from './actionOutcome';
import { AUTOMATION_ERROR_CODES } from './constants';

describe('resolveActionOutcome', () => {
  it('reads anything without an envelope as the action payload', () => {
    expect(resolveActionOutcome({ ok: false, status: 404 })).toEqual({
      status: 'success',
      result: { ok: false, status: 404 },
    });

    expect(resolveActionOutcome(null)).toEqual({
      status: 'success',
      result: null,
    });
  });

  it('leaves a payload that happens to carry its own outcome field alone', () => {
    const response = { outcome: { winner: 'a' } };

    expect(resolveActionOutcome(response)).toEqual({
      status: 'success',
      result: response,
    });
  });

  it('carries the reason of a skipped action', () => {
    expect(
      resolveActionOutcome(
        buildSkippedAction('window-closed', { lastInboundAt: 'yesterday' }),
      ),
    ).toEqual({
      status: 'skipped',
      reason: 'window-closed',
      result: { lastInboundAt: 'yesterday' },
    });
  });

  it('carries the message, code and evidence of a failed action', () => {
    expect(
      resolveActionOutcome(
        buildFailedAction(
          'Outgoing webhook responded 404 Not Found',
          AUTOMATION_ERROR_CODES.WEBHOOK_FAILED,
          { status: 404 },
        ),
      ),
    ).toEqual({
      status: 'failed',
      message: 'Outgoing webhook responded 404 Not Found',
      code: AUTOMATION_ERROR_CODES.WEBHOOK_FAILED,
      result: { status: 404 },
    });
  });

  it('never silences a malformed declaration into a success', () => {
    expect(resolveActionOutcome({ outcome: { status: 'skipped' } })).toEqual({
      status: 'skipped',
      reason: 'unspecified',
      result: undefined,
    });

    expect(resolveActionOutcome({ outcome: { status: 'failed' } })).toEqual({
      status: 'failed',
      message: 'Action reported a failure',
      code: AUTOMATION_ERROR_CODES.UNKNOWN,
      result: undefined,
    });
  });
});

describe('isActionOutcomeEnvelope', () => {
  it('recognizes only a declared outcome', () => {
    expect(isActionOutcomeEnvelope(buildSkippedAction('send-blocked'))).toBe(
      true,
    );
    expect(isActionOutcomeEnvelope({ outcome: { status: 'done' } })).toBe(
      false,
    );
    expect(isActionOutcomeEnvelope({ result: { ok: true } })).toBe(false);
    expect(isActionOutcomeEnvelope(undefined)).toBe(false);
  });
});
