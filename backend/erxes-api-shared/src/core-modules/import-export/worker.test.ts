import * as express from 'express';
import { initializePluginConfig } from '../../utils';
import { startImportExportWorker } from './worker';

const mockRedisStore = new Map<string, string>();

/**
 * Settles on a later turn, like a Redis round trip. A read returns what the
 * store held when it was sent, so two overlapping read-modify-writes lose the
 * first write, as they do against real Redis.
 */
const mockRoundTrip = <T>(value: T) =>
  new Promise<T>((resolve) => setImmediate(() => resolve(value)));

jest.mock('../../utils', () => ({
  createMQWorkerWithListeners: jest.fn(),
  createTRPCContext: jest.fn(),
  getEnv: ({ defaultValue }: { defaultValue: string }) => defaultValue,
  redis: {},
  initializePluginConfig: async (
    pluginName: string,
    propertyName: string,
    config: object,
  ) => {
    const key = `erxesservice:config:${pluginName}`;
    const current = JSON.parse(
      (await mockRoundTrip(mockRedisStore.get(key))) || '{}',
    );

    mockRedisStore.set(
      key,
      JSON.stringify({
        ...current,
        meta: { ...current.meta, [propertyName]: config },
      }),
    );

    await mockRoundTrip('OK');
  },
}));

describe('startImportExportWorker', () => {
  it('keeps its export flags when the payments config is written next', async () => {
    await startImportExportWorker({
      pluginName: 'sales',
      config: {
        export: {
          types: [{ label: 'POS Items', contentType: 'sales:pos.posItems' }],
          getExportHeaders: async () => [],
          getExportData: async () => [],
        },
      },
      app: express(),
    });
    await initializePluginConfig('sales', 'payments', { enabled: true });

    const config = JSON.parse(
      mockRedisStore.get('erxesservice:config:sales') || '{}',
    );

    expect(config.meta?.importExport?.export).toMatchObject({
      configured: true,
      hasGetExportHeaders: true,
      hasGetExportData: true,
    });
    expect(config.meta?.payments).toEqual({ enabled: true });
  });
});
