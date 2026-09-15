import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import type { TestContext } from './helperHarness';
import { createTransportHarness } from './transportHarness';
import { isolateViberModules } from './moduleHarness';

const createSettingsHarness = (t: TestContext) => {
  const h = createTransportHarness(t);
  const state: {
    hostnames: string[] | null;
    environment: string;
    failWrite: boolean;
  } = {
    hostnames: null,
    environment: '',
    failWrite: false,
  };
  const read = t.mock.fn(async (selector: unknown) => {
    deepStrictEqual(selector, { _id: 'media' });
    return state.hostnames === null
      ? null
      : { _id: 'media', mediaHostnames: [...state.hostnames] };
  });
  const save = t.mock.fn(
    async (
      selector: unknown,
      update: { $set: { mediaHostnames: string[] } },
      options: unknown,
    ) => {
      deepStrictEqual(selector, { _id: 'media' });
      deepStrictEqual(options, { upsert: true, runValidators: true });
      if (state.failWrite) return { acknowledged: false };
      state.hostnames = [...update.$set.mediaHostnames];
      return { acknowledged: true };
    },
  );
  const remove = t.mock.fn(async (selector: unknown) => {
    deepStrictEqual(selector, { _id: 'media' });
    if (state.failWrite) throw new Error('Database unavailable');
    state.hostnames = null;
    return { acknowledged: true };
  });
  Object.assign(h.context.models, {
    ViberSettings: { findOne: read, updateOne: save, deleteOne: remove },
  });
  const env = t.mock.fn(
    ({ name, subdomain }: { name: string; subdomain: string }) => {
      strictEqual(name, 'VIBER_MEDIA_ALLOWED_HOSTNAMES');
      strictEqual(subdomain, 'test');
      return state.environment;
    },
  );
  isolateViberModules(t, { 'erxes-api-shared/utils': { getEnv: env } }, [
    '../config',
    '../settings',
  ]);
  const settings: typeof import('../settings') = require('../settings');
  return { ...h, ...settings, settingsState: state, read, save, remove, env };
};

test('settings default to no approved hosts, then inherit the server list without requiring a bot', async (t) => {
  const h = createSettingsHarness(t);
  deepStrictEqual(await h.getViberMediaSettings(h.context), {
    hostnames: [],
    source: 'default',
  });
  h.settingsState.environment = 'MEDIA.EXAMPLE.COM, media.example.com';
  deepStrictEqual(await h.getViberMediaSettings(h.context), {
    hostnames: ['media.example.com'],
    source: 'environment',
  });
});

test('saved hostnames override the environment; an explicit empty list disables media; reset restores defaults', async (t) => {
  const h = createSettingsHarness(t);
  h.settingsState.environment = 'server.example.com';
  deepStrictEqual(
    await h.updateViberMediaSettings(h.context, [
      ' Saved.Example.Com ',
      'saved.example.com',
    ]),
    { hostnames: ['saved.example.com'], source: 'settings' },
  );
  strictEqual(h.env.mock.callCount(), 0);
  deepStrictEqual(await h.updateViberMediaSettings(h.context, []), {
    hostnames: [],
    source: 'settings',
  });
  strictEqual(h.env.mock.callCount(), 0);
  deepStrictEqual(await h.updateViberMediaSettings(h.context, null), {
    hostnames: ['server.example.com'],
    source: 'environment',
  });
});

test('read and write authorization finish before settings I/O, including reset', async (t) => {
  const h = createSettingsHarness(t);
  h.state.denyPermission = true;
  await rejects(h.getViberMediaSettings(h.context), /Permission denied/);
  await rejects(
    h.updateViberMediaSettings(h.context, ['media.example.com']),
    /Permission denied/,
  );
  await rejects(
    h.updateViberMediaSettings(h.context, null),
    /Permission denied/,
  );
  deepStrictEqual(
    h.permission.mock.calls.map((call) => call.arguments[0]),
    ['showIntegrations', 'integrationsEdit', 'integrationsEdit'],
  );
  strictEqual(
    h.read.mock.callCount() +
      h.save.mock.callCount() +
      h.remove.mock.callCount(),
    0,
  );
  Object.assign(h.context, { user: null });
  await rejects(h.getViberMediaSettings(h.context), /Authentication required/);
  await rejects(
    h.updateViberMediaSettings(h.context, []),
    /Authentication required/,
  );
  strictEqual(h.permission.mock.callCount(), 3);
});

test('invalid configuration fails before a write, and a malformed server fallback cannot clear an override', async (t) => {
  const h = createSettingsHarness(t);
  await rejects(
    h.updateViberMediaSettings(h.context, ['*.example.com']),
    /exact public hostnames/,
  );
  strictEqual(h.save.mock.callCount(), 0);
  h.settingsState.environment = '*';
  h.settingsState.hostnames = ['saved.example.com'];
  await rejects(
    h.updateViberMediaSettings(h.context, null),
    /Invalid Viber media hostname configuration/,
  );
  strictEqual(h.remove.mock.callCount(), 0);
});

test('failed writes and reads propagate instead of reporting successful configuration', async (t) => {
  const h = createSettingsHarness(t);
  h.settingsState.failWrite = true;
  await rejects(
    h.updateViberMediaSettings(h.context, ['media.example.com']),
    /Unable to update/,
  );
  await rejects(
    h.updateViberMediaSettings(h.context, null),
    /Database unavailable/,
  );
  h.read.mock.mockImplementation(async () => {
    throw new Error('Database unavailable');
  });
  await rejects(h.getViberMediaSettings(h.context), /Database unavailable/);
  strictEqual(h.env.mock.callCount(), 1);
});

test('settings use only the supplied tenant models and never a process-wide cache', async (t) => {
  const h = createSettingsHarness(t);
  await h.updateViberMediaSettings(h.context, ['tenant-a.example.com']);
  const second = createTransportHarness(t);
  Object.assign(second.context, { subdomain: 'other' });
  Object.assign(second.context.models, {
    ViberSettings: {
      findOne: async () => ({ mediaHostnames: ['tenant-b.example.com'] }),
    },
  });
  deepStrictEqual(await h.getViberMediaSettings(second.context), {
    hostnames: ['tenant-b.example.com'],
    source: 'settings',
  });
  h.settingsState.hostnames = [];
  deepStrictEqual(await h.getViberMediaSettings(h.context), {
    hostnames: [],
    source: 'settings',
  });
});
