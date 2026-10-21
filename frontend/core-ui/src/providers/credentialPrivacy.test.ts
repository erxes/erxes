import {
  containsCredentialTelemetry,
  isCredentialSettingsPage,
} from './credentialPrivacy';

describe('credential browser telemetry boundary', () => {
  afterEach(() => window.history.replaceState({}, '', '/'));

  it('protects both current connection and legacy credentials routes', () => {
    window.history.replaceState({}, '', '/settings/connections');
    expect(isCredentialSettingsPage()).toBe(true);
    window.history.replaceState({}, '', '/settings/connections/child');
    expect(isCredentialSettingsPage()).toBe(true);
    window.history.replaceState({}, '', '/settings/credentials');
    expect(isCredentialSettingsPage()).toBe(true);
    window.history.replaceState({}, '', '/settings/credentials/child');
    expect(isCredentialSettingsPage()).toBe(true);
    window.history.replaceState({}, '', '/settings/general');
    expect(isCredentialSettingsPage()).toBe(false);
  });

  it('drops vault traces even if they finish after leaving settings', () => {
    expect(
      containsCredentialTelemetry({ transaction: '/settings/credentials' }),
    ).toBe(true);
    expect(
      containsCredentialTelemetry({ transaction: '/settings/connections' }),
    ).toBe(true);
    expect(
      containsCredentialTelemetry({
        spans: [
          { data: { query: 'mutation { alias: credentialsGrantCreate }' } },
        ],
      }),
    ).toBe(true);
    expect(
      containsCredentialTelemetry({
        request: { url: '/pl:core/credentials/consume' },
      }),
    ).toBe(true);
    expect(
      containsCredentialTelemetry({ query: 'mutation { configsEdit }' }),
    ).toBe(false);
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    expect(containsCredentialTelemetry(cyclic)).toBe(false);
  });
});
