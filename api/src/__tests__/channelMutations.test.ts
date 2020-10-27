import { graphqlRequest } from '../db/connection';
import { channelFactory, integrationFactory, userFactory } from '../db/factories';
import { Channels, Integrations, Users } from '../db/models';

import './setup.ts';

describe('mutations', () => {
  let _channel;
  let _user;
  let _integration;
  let context;

  beforeEach(async () => {
    // Creating test data
    _integration = await integrationFactory();
    _channel = await channelFactory({ integrationIds: [_integration._id] });
    _user = await userFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Channels.deleteMany({});
    await Integrations.deleteMany({});
    await Users.deleteMany({});
  });

  const commonParamDefs = `
    $name: String!
    $description: String!
    $memberIds: [String]
    $integrationIds: [String]
  `;

  const commonParams = `
    name: $name
    description: $description
    memberIds: $memberIds
    integrationIds: $integrationIds
  `;

  test('Add channel', async () => {
    process.env.DEFAULT_EMAIL_SERIVCE = '';
    process.env.COMPANY_EMAIL_FROM = ' ';

    const args = {
      name: _channel.name,
      description: _channel.description,
      memberIds: [_user._id],
      integrationIds: [_integration._id],
    };

    const mutation = `
      mutation channelsAdd(${commonParamDefs}) {
        channelsAdd(${commonParams}) {
          name
          description
          memberIds
          integrationIds
        }
      }
    `;

    const channel = await graphqlRequest(mutation, 'channelsAdd', args, context);

    expect(channel.name).toBe(args.name);
    expect(channel.description).toBe(args.description);
    expect(channel.memberIds).toEqual(args.memberIds);
    expect(channel.integrationIds).toEqual(args.integrationIds);
  });

  test('Edit channel', async () => {
    process.env.COMPANY_EMAIL_FROM = ' ';
    const member = await userFactory({});

    const args = {
      _id: _channel._id,
      name: _channel.name,
      description: _channel.description,
      memberIds: [member._id],
      integrationIds: [_integration._id],
    };

    const mutation = `
      mutation channelsEdit($_id: String!, ${commonParamDefs}) {
        channelsEdit(_id: $_id, ${commonParams}) {
          _id
          name
          description
          memberIds
          integrationIds
        }
      }
    `;

    const channel = await graphqlRequest(mutation, 'channelsEdit', args, context);

    expect(channel._id).toBe(args._id);
    expect(channel.name).toBe(args.name);
    expect(channel.description).toBe(args.description);
    expect(channel.memberIds).toEqual([member._id]);
    expect(channel.integrationIds).toEqual(args.integrationIds);

    // if channel integrationIds changed
    args.integrationIds = ['updatedId'];
    const channelNoIntegration = await graphqlRequest(mutation, 'channelsEdit', args, context);

    expect(channelNoIntegration.integrationIds).toEqual(args.integrationIds);
  });

  test('Remove channel', async () => {
    const mutation = `
      mutation channelsRemove($_id: String!) {
        channelsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'channelsRemove', { _id: _channel._id }, context);

    expect(await Channels.findOne({ _id: _channel._id })).toBe(null);
  });
});
