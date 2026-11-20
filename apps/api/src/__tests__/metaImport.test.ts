import { createCoreClient } from '@erxes/plugin-sdk';
import { describe, expect, it } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { INSTALL_APP, signed, useFakeGraph } from './fakeGraph';
import { settle } from './settle';
import { useTwoOrgs } from './support';

const PAGE = '6006';

const message = (sender: string, text: string) =>
  JSON.stringify({
    object: 'page',
    entry: [
      {
        id: PAGE,
        time: Date.now(),
        messaging: [
          {
            sender: { id: sender },
            recipient: { id: PAGE },
            timestamp: Date.now(),
            message: { mid: `m_${sender}`, text },
          },
        ],
      },
    ],
  });

describe('meta import', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const graph = useFakeGraph();

  const pluginCore = async () => {
    const core = createCoreClient({
      coreUrl: t.url(''),
      plugin: 'hr',
      clientSecret: await rotatePluginSecret('hr'),
    });

    await core.registerManifest({
      title: 'HR',
      version: '4',
      scopes: ['meta:read', 'meta:write'],
      events: [
        { type: 'hr.facebook.message_received', label: 'Facebook message', subject: 'customer' },
        { type: 'hr.facebook.comment_received', label: 'Facebook comment', subject: 'customer' },
      ],
      actions: [
        {
          type: 'hr.facebook.reply',
          label: 'Reply on Facebook',
          subject: 'customer',
          fields: [{ key: 'message', label: 'Message', type: 'longtext', required: true }],
        },
      ],
    });

    return core.forOrg(t.ids.org);
  };

  const saved = async (name: string, event: string, text: string) => {
    const automation = await t.owner().automations.create({
      name,
      definition: {
        trigger: { kind: 'event', event },
        steps: [
          { id: 'reply', type: 'action', action: 'hr.facebook.reply', input: { message: text } },
        ],
      },
    });

    await t.owner().automations.activate({ id: automation.id });

    return automation.id;
  };

  it("moves the plugin's saved Messenger automation with the import, and its reply goes out through Meta", async () => {
    const plugin = await pluginCore();

    const chat = await saved(
      'Messenger auto reply',
      'hr.facebook.message_received',
      'Got it: {{event.payload.content}}',
    );

    const comments = await saved(
      'Comment auto reply',
      'hr.facebook.comment_received',
      'See {{event.payload.conversationId}}',
    );

    const answer = await plugin.meta.import({
      connections: [
        {
          kind: 'facebook',
          externalId: PAGE,
          pageId: PAGE,
          name: 'Shop',
          pageToken: 'page-token-shop',
          app: 'install',
        },
      ],
    });

    expect(answer).toMatchObject({
      connections: 1,
      automations: 2,
      placeholdersLeft: 1,
      stepsLeft: 0,
    });
    expect((await t.owner().automations.get({ id: comments })).definition).toMatchObject({
      trigger: { event: 'core.facebook.comment_received' },
      steps: [
        {
          action: 'core.facebook.reply_to_comment',
          input: { text: 'See {{event.payload.conversationId}}' },
        },
      ],
    });

    const raw = message('psid-moved', 'is it in stock?');

    await fetch(t.url('/core/v1/meta/webhook'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': signed(INSTALL_APP.appSecret, raw),
      },
      body: raw,
    });
    await settle();

    const replies = graph.callsTo('me/messages');

    expect(replies).toHaveLength(1);
    expect(replies[0]).toMatchObject({
      auth: 'Bearer page-token-shop',
      body: { recipient: { id: 'psid-moved' }, message: { text: 'Got it: is it in stock?' } },
    });

    const [run] = (await t.owner().automations.runs({ id: chat })).data;

    expect(run).toMatchObject({ status: 'succeeded', version: 2 });
  });
});
