import type { test } from 'node:test';
import { Module } from 'node:module';

// The installed Node types do not export the callback context by name.
export type TestContext = Parameters<
  NonNullable<Parameters<typeof test>[0]>
>[0];

interface HelperModuleMocks {
  sharedUtils: Record<string, unknown>;
  connectionResolvers: Record<string, unknown>;
  inboxReceiver: Record<string, unknown>;
  messagePublisher?: Record<string, unknown>;
}

export const loadViberHelpers = (
  t: TestContext,
  mocks: HelperModuleMocks,
): typeof import('../helpers') => {
  // Resolve indirectly so Nx does not classify the shared barrel as a lazy import.
  const [
    utilsPath,
    modelsPath,
    inboxPath,
    publisherPath,
    configPath,
    helperPath,
    channelPath,
    accessPath,
  ] = [
    'erxes-api-shared/utils',
    '~/connectionResolvers',
    '@/inbox/receiveMessage',
    '@/inbox/graphql/resolvers/mutations/widget',
    '../config',
    '../helpers',
    '@/channel/utils',
    '../access',
  ].map((specifier) => require.resolve(specifier));
  const originalModules = new Map(
    [
      utilsPath,
      modelsPath,
      inboxPath,
      publisherPath,
      configPath,
      helperPath,
      channelPath,
      accessPath,
    ].map((filename) => [filename, require.cache[filename]]),
  );

  t.after(() => {
    for (const [filename, original] of originalModules) {
      if (original) {
        require.cache[filename] = original;
      } else {
        delete require.cache[filename];
      }
    }
  });

  const replaceModule = (
    filename: string,
    exports: Record<string, unknown>,
  ) => {
    const replacement = new Module(filename);
    replacement.filename = filename;
    replacement.loaded = true;
    replacement.exports = exports;
    require.cache[filename] = replacement;
  };

  replaceModule(utilsPath, mocks.sharedUtils);
  replaceModule(modelsPath, mocks.connectionResolvers);
  replaceModule(inboxPath, mocks.inboxReceiver);
  replaceModule(publisherPath, mocks.messagePublisher ?? {});
  replaceModule(channelPath, {});
  // These tests exercise provider lifecycle; access rules are tested with the
  // real implementation in transport/access tests.
  replaceModule(accessPath, {
    assertViberChannelAccess: async () => undefined,
    assertViberIntegrationAccess: async (
      context: { checkPermission: (action: string) => Promise<void> },
      _id: string,
      action: string,
    ) => context.checkPermission(action),
  });
  delete require.cache[configPath];
  delete require.cache[helperPath];

  const helpers: typeof import('../helpers') = require('../helpers');
  return helpers;
};
