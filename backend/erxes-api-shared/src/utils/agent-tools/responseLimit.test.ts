import {
  AGENT_TOOL_DEFAULT_MAX_RESPONSE_BYTES,
  agentToolResponseTooLargeError,
  getAgentToolMaxResponseBytes,
  oversizedAgentToolResultBytes,
} from './responseLimit';

describe('responseLimit', () => {
  const ORIGINAL_ENV = process.env.AGENT_TOOLS_MAX_RESPONSE_BYTES;

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) {
      delete process.env.AGENT_TOOLS_MAX_RESPONSE_BYTES;
    } else {
      process.env.AGENT_TOOLS_MAX_RESPONSE_BYTES = ORIGINAL_ENV;
    }
  });

  describe('getAgentToolMaxResponseBytes', () => {
    it('falls back to the 64KB default when the env var is unset', () => {
      delete process.env.AGENT_TOOLS_MAX_RESPONSE_BYTES;

      expect(getAgentToolMaxResponseBytes()).toBe(
        AGENT_TOOL_DEFAULT_MAX_RESPONSE_BYTES,
      );
    });

    it('honors a positive numeric override', () => {
      process.env.AGENT_TOOLS_MAX_RESPONSE_BYTES = '1024';

      expect(getAgentToolMaxResponseBytes()).toBe(1024);
    });

    it.each(['abc', '0', '-5'])(
      'falls back to the default for invalid value "%s"',
      (value) => {
        process.env.AGENT_TOOLS_MAX_RESPONSE_BYTES = value;

        expect(getAgentToolMaxResponseBytes()).toBe(
          AGENT_TOOL_DEFAULT_MAX_RESPONSE_BYTES,
        );
      },
    );
  });

  describe('oversizedAgentToolResultBytes', () => {
    it('returns null when the serialized result fits', () => {
      expect(oversizedAgentToolResultBytes({ ok: true }, 1024)).toBeNull();
    });

    it('returns null when the result fits exactly', () => {
      const result = 'x'.repeat(100);

      expect(oversizedAgentToolResultBytes(result, 102)).toBeNull();
    });

    it('returns the byte size when the result exceeds the budget', () => {
      const result = { data: new Array(1000).fill('row') };

      const bytes = oversizedAgentToolResultBytes(result, 1024);

      expect(bytes).toBe(Buffer.byteLength(JSON.stringify(result), 'utf8'));
    });

    it('counts multi-byte characters by UTF-8 bytes, not string length', () => {
      const result = 'үү'.repeat(100); // 2 bytes each in UTF-8

      expect(oversizedAgentToolResultBytes(result, 50)).toBe(
        Buffer.byteLength(JSON.stringify(result), 'utf8'),
      );
    });

    it('returns null for unserializable results instead of throwing', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      expect(oversizedAgentToolResultBytes(circular, 1)).toBeNull();
    });
  });

  describe('agentToolResponseTooLargeError', () => {
    it('carries the code, sizes, and narrowing guidance', () => {
      const error = agentToolResponseTooLargeError(
        'sales.trpc.deal.find',
        150_000,
        65_536,
      );

      expect(error).toBeInstanceOf(Error);
      expect((error as Error & { code?: string }).code).toBe(
        'RESPONSE_TOO_LARGE',
      );
      expect(error.message).toContain('sales.trpc.deal.find');
      expect(error.message).toContain('150000');
      expect(error.message).toContain('65536');
      expect(error.message).toContain('limit');
    });
  });
});
