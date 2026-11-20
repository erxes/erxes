import { describe, expect, it } from 'vite-plus/test';
import { metaCheckSchedule } from '~/modules/meta/checks';
import { useTestDatabase } from './db';
import { useFakeGraph } from './fakeGraph';
import { useTwoOrgs } from './support';

const PAGE = '8008';

describe('meta daily check', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const graph = useFakeGraph();

  const daily = async () => {
    const before = graph.fake.calls.length;

    await metaCheckSchedule.queues[0]?.run();

    return graph.fake.calls.slice(before);
  };

  const connection = async () =>
    (await t.owner().meta.connections({})).data.find((row) => row.externalId === PAGE);

  const brokenNotices = async () =>
    (await t.owner().notifications.list({ kind: 'core.integration.broken' })).data;

  it('subscribes each page again and restores its relay route, and a refused token breaks it and tells who connected it, once', async () => {
    graph.fake.pages = [{ id: PAGE, name: 'Daily page', access_token: 'page-token-daily' }];

    const login = new URL((await t.owner().meta.loginUrl()).url);
    const state = login.searchParams.get('state') ?? '';

    await fetch(
      t.url(`/core/v1/meta/callback?${new URLSearchParams({ code: 'granted', state }).toString()}`),
      { redirect: 'manual' },
    );

    graph.fake.relayDown = true;

    const relayDown = await daily();

    expect(relayDown.map((call) => `${call.method} ${call.path}`)).toEqual(
      expect.arrayContaining([
        `POST ${PAGE}/subscribed_apps`,
        `PUT /relay/v1/routes/facebook/${PAGE}`,
        'GET me',
      ]),
    );
    expect(await connection()).toMatchObject({ status: 'healthy' });

    graph.fake.relayDown = false;
    graph.fake.refuseTokens = true;

    await daily();
    await daily();

    graph.fake.refuseTokens = false;

    expect(await connection()).toMatchObject({
      status: 'broken',
      statusReason: 'Error validating access token',
    });
    expect(await brokenNotices()).toEqual([
      expect.objectContaining({ title: 'A Meta connection stopped working' }),
    ]);

    await daily();

    expect(await connection()).toMatchObject({ status: 'healthy' });
  });
});
