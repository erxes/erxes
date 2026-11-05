import {
  findNotificationEventDefaults,
  resolveEventChannels,
  TNotificationEventDefaults,
} from '~/modules/notifications/channels';

const getPlugin = jest.fn();

jest.mock('erxes-api-shared/utils', () => ({
  getPlugin: (name: string) => getPlugin(name),
}));

// the full barrel pulls in every shared model; the channel list is all that is read
jest.mock('erxes-api-shared/core-modules', () =>
  jest.requireActual(
    'erxes-api-shared/core-modules/notifications/definitions/notificationSettings',
  ),
);

const EVENT = 'frontline:conversations:conversationAddMessage';

const NO_DEFAULTS: TNotificationEventDefaults = {
  pluginChannels: [],
  moduleEnabled: false,
  eventChannels: [],
};

const MOBILE_DEFAULT: TNotificationEventDefaults = {
  pluginChannels: ['mobile'],
  moduleEnabled: true,
  eventChannels: ['mobile'],
};

const saved = {
  frontline: { enabled: true, channels: ['email', 'mobile'] },
  'frontline:conversations': { enabled: true },
  [EVENT]: { enabled: true, mutedChannels: ['email'] },
};

describe('resolveEventChannels', () => {
  it('reaches nobody on an event without defaults the user never set', () => {
    expect(resolveEventChannels({}, EVENT, NO_DEFAULTS)).toEqual([]);
  });

  it('uses the plugin channels without the muted ones once saved', () => {
    expect(resolveEventChannels(saved, EVENT, NO_DEFAULTS)).toEqual([
      'mobile',
    ]);
  });

  it('stands in the default for every level the user never saved', () => {
    expect(resolveEventChannels({}, EVENT, MOBILE_DEFAULT)).toEqual([
      'mobile',
    ]);
  });

  it('keeps a saved event choice over its default', () => {
    const events = { [EVENT]: { enabled: false } };

    expect(resolveEventChannels(events, EVENT, MOBILE_DEFAULT)).toEqual([]);
  });

  it('silences a default when the user switched the module off', () => {
    const events = { 'frontline:conversations': { enabled: false } };

    expect(resolveEventChannels(events, EVENT, MOBILE_DEFAULT)).toEqual([]);
  });

  it('keeps a default off a channel the user dropped from the plugin', () => {
    const events = { frontline: { enabled: true, channels: ['email'] } };

    expect(resolveEventChannels(events, EVENT, MOBILE_DEFAULT)).toEqual([]);
  });
});

describe('findNotificationEventDefaults', () => {
  beforeEach(() => {
    getPlugin.mockReset().mockResolvedValue({
      config: {
        meta: {
          notifications: {
            modules: [
              {
                name: 'conversations',
                events: [
                  { name: 'conversationAddMessage', defaultChannels: ['mobile'] },
                  { name: 'conversationStateChange' },
                ],
              },
              { name: 'channels', events: [{ name: 'channelMembersChange' }] },
            ],
          },
        },
      },
    });
  });

  it('reads the event, module and plugin defaults from the meta', async () => {
    expect(await findNotificationEventDefaults(EVENT)).toEqual(MOBILE_DEFAULT);
  });

  it('gives a sibling module no default of its own', async () => {
    expect(
      await findNotificationEventDefaults(
        'frontline:channels:channelMembersChange',
      ),
    ).toEqual({ pluginChannels: ['mobile'], moduleEnabled: false, eventChannels: [] });
  });

  it('returns null for an event no plugin declared', async () => {
    expect(
      await findNotificationEventDefaults('frontline:inbox:inboxAssignee'),
    ).toBeNull();
  });

  it('reads core events from the core modules', async () => {
    expect(
      await findNotificationEventDefaults(
        'core:structure:branchAssigneeChanged',
      ),
    ).toEqual(NO_DEFAULTS);
    expect(getPlugin).not.toHaveBeenCalled();
  });
});
