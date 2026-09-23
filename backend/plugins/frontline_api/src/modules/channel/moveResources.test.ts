import {
  CHANNEL_RESOURCE_DEFINITIONS,
  ChannelResourceType,
  IMovableResource,
  isChannelResourceType,
  validateChannelMove,
} from '@/channel/moveResources';

const definition = CHANNEL_RESOURCE_DEFINITIONS[ChannelResourceType.FORM];

const resource = (
  _id: string,
  channelId: string,
  name = _id,
): IMovableResource => ({ _id, channelId, name });

const run = (
  overrides: Partial<Parameters<typeof validateChannelMove>[0]> = {},
) =>
  validateChannelMove({
    definition,
    sourceChannelId: 'channel-a',
    targetChannelId: 'channel-b',
    resourceIds: ['form-1'],
    resources: [resource('form-1', 'channel-a')],
    conflictingNames: [],
    ...overrides,
  });

describe('isChannelResourceType', () => {
  it('accepts every type the UI can send', () => {
    expect(isChannelResourceType('integration')).toBe(true);
    expect(isChannelResourceType('pipeline')).toBe(true);
    expect(isChannelResourceType('form')).toBe(true);
    expect(isChannelResourceType('survey')).toBe(true);
    expect(isChannelResourceType('responseTemplate')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isChannelResourceType('conversation')).toBe(false);
    expect(isChannelResourceType('')).toBe(false);
  });
});

describe('CHANNEL_RESOURCE_DEFINITIONS', () => {
  it('names a permission and a channel-owned name field for every type', () => {
    Object.values(ChannelResourceType).forEach((type) => {
      const config = CHANNEL_RESOURCE_DEFINITIONS[type];

      expect(config.permission).toBeTruthy();
      expect(['name', 'title']).toContain(config.nameField);
      expect(config.label).toBeTruthy();
      expect(config.labelPlural).toBeTruthy();
    });
  });
});

describe('validateChannelMove', () => {
  it('passes a well-formed move', () => {
    expect(() => run()).not.toThrow();
  });

  it('requires a destination channel', () => {
    expect(() => run({ targetChannelId: '' })).toThrow(
      'Select a destination channel.',
    );
  });

  it('requires a known current channel', () => {
    expect(() => run({ sourceChannelId: '' })).toThrow(
      'The current channel is unknown.',
    );
  });

  it('refuses a move into the same channel', () => {
    expect(() => run({ targetChannelId: 'channel-a' })).toThrow(
      'The destination channel must be different from the current one.',
    );
  });

  it('refuses an empty selection', () => {
    expect(() => run({ resourceIds: [], resources: [] })).toThrow(
      'Select at least one form to move.',
    );
  });

  it('refuses when a selected resource no longer exists', () => {
    expect(() => run({ resourceIds: ['form-1', 'form-2'] })).toThrow(
      '1 of the selected forms no longer exist.',
    );
  });

  it('refuses when a selected resource left the source channel', () => {
    expect(() => run({ resources: [resource('form-1', 'channel-c')] })).toThrow(
      '1 of the selected forms are no longer in this channel. Reload the page and try again.',
    );
  });

  it('refuses a resource whose channel was never set', () => {
    expect(() => run({ resources: [resource('form-1', '')] })).toThrow(
      'no longer in this channel',
    );
  });

  it('refuses a name already taken in the destination channel', () => {
    expect(() => run({ conflictingNames: ['Contact us'] })).toThrow(
      'The destination channel already has a form named "Contact us". Rename it before moving.',
    );
  });

  it('reports the resource label of the type being moved', () => {
    expect(() =>
      validateChannelMove({
        definition:
          CHANNEL_RESOURCE_DEFINITIONS[ChannelResourceType.RESPONSE_TEMPLATE],
        sourceChannelId: 'channel-a',
        targetChannelId: 'channel-b',
        resourceIds: [],
        resources: [],
        conflictingNames: [],
      }),
    ).toThrow('Select at least one response template to move.');
  });

  it('accepts a multi-resource bulk move', () => {
    expect(() =>
      run({
        resourceIds: ['form-1', 'form-2', 'form-3'],
        resources: [
          resource('form-1', 'channel-a'),
          resource('form-2', 'channel-a'),
          resource('form-3', 'channel-a'),
        ],
      }),
    ).not.toThrow();
  });
});
