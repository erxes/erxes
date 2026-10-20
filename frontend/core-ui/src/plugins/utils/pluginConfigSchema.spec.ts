import {
  getPlatformMismatch,
  validatePluginConfig,
} from '~/plugins/utils/pluginConfigSchema';
import { IUIConfig } from 'erxes-ui';

const valid = {
  name: 'sales',
  path: 'sales',
  platform: '~3.2',
  navigationGroup: {
    name: 'sales',
    defaultPath: 'sales/deals',
    icon: () => null,
  },
  modules: [{ name: 'deals', path: 'sales/deals' }],
  widgets: { anything: true },
};

describe('validatePluginConfig', () => {
  it('accepts a valid config and keeps unknown fields', () => {
    const result = validatePluginConfig('sales_ui', valid);

    expect(result.ok).toBe(true);
    expect(result.ok && result.config).toBe(valid);
  });

  it('lists every problem in one message', () => {
    const result = validatePluginConfig('sales_ui', {
      ...valid,
      path: '/sales/',
      platform: '>=banana',
      modules: [{ name: '', path: 'sales/deals' }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain('Plugin "sales_ui" was not loaded');
    expect(result.message).toContain('path:');
    expect(result.message).toContain('platform:');
    expect(result.message).toContain('modules.0.name:');
  });

  it('rejects a config that is not an object', () => {
    expect(validatePluginConfig('broken_ui', undefined).ok).toBe(false);
  });
});

describe('getPlatformMismatch', () => {
  const config = valid as unknown as IUIConfig;

  it('is silent when the platform matches or is unknown', () => {
    expect(getPlatformMismatch(config, '3.2.25')).toBeNull();
    expect(getPlatformMismatch(config, undefined)).toBeNull();
    expect(
      getPlatformMismatch({ ...config, platform: undefined }, '4.0.0'),
    ).toBeNull();
  });

  it('explains a mismatch', () => {
    expect(getPlatformMismatch(config, '3.3.0')).toBe(
      'Built for erxes ~3.2; this is erxes 3.3.0.',
    );
  });
});
