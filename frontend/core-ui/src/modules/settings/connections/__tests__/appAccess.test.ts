import {
  connectionAccessName,
  connectionAppLabel,
  connectionApps,
  connectionSetupInstructions,
} from '../appAccess';

describe('friendly app setup', () => {
  it('uses installed apps and the real core service instead of asking for plugin names', () => {
    expect(
      connectionApps({
        sales_ui: { name: 'sales' },
        duplicate: { name: 'sales' },
        invalid: { name: 'not_a_backend' },
      }),
    ).toEqual([
      { id: 'core', label: 'erxes workspace' },
      { id: 'sales', label: 'Sales' },
    ]);
    expect(connectionApps(null)).toEqual([
      { id: 'core', label: 'erxes workspace' },
    ]);
    expect(connectionAppLabel('custom-worker')).toBe('Custom Worker');
  });

  it('creates a bounded access name automatically', () => {
    expect(connectionAccessName('Sales')).toBe('Sales connection access');
    expect(connectionAccessName('a'.repeat(150)).length).toBe(120);
  });

  it('provides concrete private developer instructions without inventing an endpoint or claiming an active integration', () => {
    const instructions = connectionSetupInstructions({
      connectionName: 'Production AI',
      reference: 'cred_test-reference',
      pluginName: 'sales',
      token: 'synthetic-one-time-token',
    });
    expect(instructions).toContain(
      'PLATFORM_CREDENTIALS_REFERENCE to cred_test-reference',
    );
    expect(instructions).toContain(
      'PLATFORM_CREDENTIALS_TOKEN to synthetic-one-time-token',
    );
    expect(instructions).toContain('getCredentialValues()');
    expect(instructions).toContain('do not automatically switch');
    expect(instructions).not.toContain('localhost');
  });
});
