import { workflowTenant, workflowDbName, extractJsonObject } from '../runtime';

describe('workflow runtime (pure parts)', () => {
  describe('workflowTenant', () => {
    it('pins "os" for non-saas regardless of the request subdomain', () => {
      expect(workflowTenant('localhost', {})).toBe('os');
      expect(workflowTenant(undefined, {})).toBe('os');
    });

    it('uses the org subdomain in saas mode', () => {
      expect(workflowTenant('acme', { VERSION: 'saas' })).toBe('acme');
      expect(workflowTenant(undefined, { VERSION: 'saas' })).toBe('os');
    });
  });

  describe('workflowDbName', () => {
    it('is dedicated and never the erxes db (collection-collision guard)', () => {
      expect(workflowDbName('os', {})).toBe('erxes_mastra_runtime_os');
    });

    it('honors the env prefix override and sanitizes hostile tenants', () => {
      expect(
        workflowDbName('os', { ERXES_AGENT_WORKFLOW_DB_PREFIX: 'wfx' }),
      ).toBe('wfx_os');
      expect(workflowDbName('a.b/c', {})).toBe('erxes_mastra_runtime_a_b_c');
    });
  });

  describe('extractJsonObject', () => {
    it('parses a bare JSON object', () => {
      expect(extractJsonObject('{"a": 1}')).toEqual({ a: 1 });
    });

    it('parses fenced ```json blocks', () => {
      expect(
        extractJsonObject('Sure!\n```json\n{"intent": "order"}\n```'),
      ).toEqual({
        intent: 'order',
      });
    });

    it('parses JSON surrounded by prose', () => {
      expect(
        extractJsonObject('Here you go: {"x": true} hope that helps'),
      ).toEqual({ x: true });
    });

    it('throws a clear error when no object is present', () => {
      expect(() => extractJsonObject('no json here')).toThrow(/no JSON object/);
    });
  });
});
