import { beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const load = async () => import('../pluginConfig');

// Each test loads the module afresh, so what it builds on load is each test's.
beforeAll(load);

beforeEach(() => {
  vi.resetModules();
});

const parse = async (value: unknown) => (await load()).parsePluginConfig('pms_ui', value);

const slot = () => null;

const tab = { value: 'orders', label: 'Orders', icon: slot, component: slot };

const service = {
  contentType: 'pms:service',
  title: 'Service',
  icon: slot,
  detailPath: (id: string) => `/pms/services/${id}`,
  Title: slot,
  Detail: slot,
  tabs: [
    tab,
    { ...tab, value: 'notes', after: 'activity', expandedOnly: false },
    { ...tab, value: 'description', after: 'detail', expandedOnly: true },
  ],
};

const room = {
  ...service,
  contentType: 'pms:room',
  title: 'Room',
  detailPath: (id: string) => `/pms/rooms/${id}`,
  activity: 'pms:room',
  contacts: (id: string) => ({ queryKey: ['room-contacts', id] }),
  properties: {
    type: 'pms.room',
    values: async () => ({}),
    save: async () => undefined,
    limits: [{ key: 'room_type', label: 'Room types', options: { queryKey: ['room-types'] } }],
    appliesTo: () => ({}),
  },
};

const FULL = {
  name: 'pms',
  path: 'pms',
  icon: slot,
  modules: [{ name: 'Rooms', path: 'rooms', icon: slot }],
  checkAccess: async () => true,
  recordSections: [
    { contentType: 'core:customer', title: 'Stays', icon: slot, component: slot },
    { contentType: 'core:company', title: 'Bookings', icon: slot, component: slot },
  ],
  recordTypes: [service, room],
  relationTabs: [
    { name: 'stays', title: 'Stays', icon: slot, hosts: ['core:customer'], component: slot },
  ],
  settings: [{ path: '/pms/settings', label: 'Rates', icon: slot }],
  integrations: [
    {
      key: 'booking-com',
      icon: slot,
      tabs: [{ value: 'overview', label: 'Overview', component: slot }],
    },
  ],
  dashboardWidgets: [
    {
      name: 'occupancy',
      title: 'Occupancy',
      description: 'Rooms taken tonight',
      icon: slot,
      preview: 'bar',
      size: { w: 2, h: 3 },
      component: slot,
    },
  ],
  floatingWidget: slot,
};

/** The config with `key`'s list as given, logging each entry it leaves out. */
const parseList = async (key: string, list: unknown[]) => {
  using errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  const parsed = await parse({ name: 'pms', path: 'pms', [key]: list });

  return { parsed, logged: errors.mock.calls.length };
};

const parseRecords = async (recordTypes: unknown[]) =>
  (await parseList('recordTypes', recordTypes)).parsed?.recordTypes;

it('keeps every well-formed part of a plugin’s config', async () => {
  expect(await parse(FULL)).toEqual(FULL);
});

it('preserves each tab’s visibility and placement', async () => {
  expect(await parseRecords([service])).toEqual([service]);
});

it.each([
  ['a non-boolean visibility flag', { expandedOnly: 'false' }],
  ['an unknown placement', { after: 'notes' }],
  ['an empty value', { value: '' }],
  ['an empty label', { label: '' }],
  ['a missing icon', { icon: null }],
  ['a string in place of a component', { component: 'orders' }],
])('skips only the record whose tab has %s', async (_case, invalidFields) => {
  const invalid = {
    ...service,
    contentType: 'pms:invalid',
    tabs: [{ ...tab, ...invalidFields }],
  };

  const { parsed, logged } = await parseList('recordTypes', [invalid, service]);

  expect(parsed?.recordTypes).toEqual([service]);
  expect(logged).toBe(1);
});

describe('a plugin’s record types', () => {
  it.each([
    ['a type with a second colon', { contentType: 'pms:room:extra' }],
    ['another plugin’s type', { contentType: 'hr:room' }],
    ['a page outside the plugin', { detailPath: (id: string) => `/hr/rooms/${id}` }],
    ['a page that is no address', { detailPath: () => 42 }],
    ['contacts that are no function', { contacts: 'room-contacts' }],
    ['an empty activity type', { activity: '' }],
    ['properties of another plugin', { properties: { ...room.properties, type: 'hr.room' } }],
    ['limits without appliesTo', { properties: { ...room.properties, appliesTo: undefined } }],
    [
      'a limit key that is not snake case',
      {
        properties: {
          ...room.properties,
          limits: [{ ...room.properties.limits[0], key: 'room type' }],
        },
      },
    ],
    [
      'a limit key that starts with a capital',
      {
        properties: {
          ...room.properties,
          limits: [{ ...room.properties.limits[0], key: 'Room' }],
        },
      },
    ],
    [
      'limit options that are missing',
      {
        properties: {
          ...room.properties,
          limits: [{ ...room.properties.limits[0], options: null }],
        },
      },
    ],
    [
      'limit options that are text',
      {
        properties: {
          ...room.properties,
          limits: [{ ...room.properties.limits[0], options: 'room-types' }],
        },
      },
    ],
  ])('leaves out %s', async (_case, fields) => {
    expect(await parseRecords([{ ...room, ...fields }, service])).toEqual([service]);
  });
});

describe('the other lists a plugin adds', () => {
  it.each([
    [
      'recordSections',
      { contentType: 'core:deal', title: 'Deals', icon: slot, component: slot },
      { contentType: 'core:customer', title: 'Stays', icon: slot, component: slot },
    ],
    [
      'settings',
      { path: '/pmsrates', label: 'Rates', icon: slot },
      { path: '/pms/rates', label: 'Rates', icon: slot },
    ],
    [
      'integrations',
      { key: 'booking-com', icon: slot, tabs: [] },
      {
        key: 'airbnb',
        icon: slot,
        tabs: [{ value: 'overview', label: 'Overview', component: slot }],
      },
    ],
    [
      'dashboardWidgets',
      { name: 'occupancy', title: 'Occupancy', icon: slot, size: { w: 0, h: 1 }, component: slot },
      { name: 'arrivals', title: 'Arrivals', icon: slot, component: slot },
    ],
  ])('leaves a broken entry out of %s and keeps the rest', async (key, broken, valid) => {
    const { parsed, logged } = await parseList(key, [broken, valid]);

    expect(parsed).toMatchObject({ [key]: [valid] });
    expect(logged).toBe(1);
  });

  it('reads a list that is not one as empty', async () => {
    using errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(
      await parse({ name: 'pms', path: 'pms', recordSections: { title: 'Stays' } }),
    ).toMatchObject({ recordSections: [] });
    expect(errors).toHaveBeenCalledOnce();
  });

  it('drops a floating widget that is not a component', async () => {
    using errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(
      (await parse({ name: 'pms', path: 'pms', floatingWidget: 'chat' }))?.floatingWidget,
    ).toBe(undefined);
    expect(errors).toHaveBeenCalledOnce();
  });
});

describe('where a plugin mounts', () => {
  it('reads the path however its slashes are written', async () => {
    const { pluginBasePath } = await load();

    expect(pluginBasePath('//hotel/pms//')).toBe('/hotel/pms');
    expect(pluginBasePath('hotel/pms')).toBe('/hotel/pms');
  });

  it('keeps settings pages under that path', async () => {
    const page = { path: '/hotel/pms/rates', label: 'Rates', icon: slot };

    expect(
      (await parse({ name: 'pms', path: '//hotel/pms//', settings: [page] }))?.settings,
    ).toEqual([page]);
  });

  it.each([
    ['no name', { path: 'pms' }],
    ['no path', { name: 'pms' }],
    ['an access check that is no function', { name: 'pms', path: 'pms', checkAccess: true }],
  ])('loads no config with %s', async (_case, config) => {
    expect(await parse(config)).toBeNull();
  });
});
