import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { hmacSha256 } from '~/lib/crypto';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { settle } from './settle';

const HOOKS = '/repos/acme/shop/hooks';

const CreatedHook = z.object({
  name: z.string(),
  active: z.boolean(),
  events: z.array(z.string()),
  config: z.object({ url: z.string(), secret: z.string(), content_type: z.string() }),
});

const issueEvent = (action: string) =>
  JSON.stringify({
    action,
    issue: {
      number: 7,
      title: 'Checkout is broken',
      html_url: 'https://github.com/acme/shop/issues/7',
      state: action === 'closed' ? 'closed' : 'open',
      body: 'The pay button does nothing',
      user: { login: 'dana' },
    },
    repository: { full_name: 'acme/shop' },
    sender: { login: 'dana' },
  });

describe('GitHub triggers', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const github = fakeGateway([
    ['GET /user', { login: 'acme-bot' }],
    [`DELETE ${HOOKS}/42`, {}],
    [`POST ${HOOKS}`, { id: 42, active: true }],
  ]);

  const githubCalls = (method: string, path: string) =>
    github.calls.filter((call) => call.method === method && call.url.endsWith(path));

  const createdHook = () =>
    CreatedHook.parse(JSON.parse(githubCalls('POST', HOOKS)[0]?.body ?? '{}'));

  const deliver = (event: string, id: string, raw: string, secret = createdHook().config.secret) =>
    fetch(t.url(new URL(createdHook().config.url).pathname), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-github-event': event,
        'x-github-delivery': id,
        'x-hub-signature-256': `sha256=${hmacSha256(secret, raw, 'hex')}`,
      },
      body: raw,
    });

  let connectionId = '';

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      urlOf(input).startsWith('https://api.github.com/')
        ? github.fetch(input, init)
        : realFetch(input, init),
    );

    connectionId = (
      await t.owner().integrations.connect({
        key: 'github',
        name: 'Shop repo',
        scope: 'personal',
        keys: { accessToken: 'ghp_test_shop' },
      })
    ).id;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('a signed new issue starts one run with its title; forged, ping and closed-issue deliveries start none; pausing removes the hook', async () => {
    expect(githubCalls('GET', '/user')[0]?.auth).toBe('Bearer ghp_test_shop');

    const id = await t.active('Triage new issues', {
      trigger: {
        kind: 'app',
        app: 'github',
        trigger: 'issue_opened',
        connectionId,
        params: { owner: 'acme', repository: 'shop' },
      },
      steps: [
        {
          id: 'check',
          type: 'branch',
          conditions: {
            match: 'all',
            rules: [{ path: 'event.payload.title', op: 'eq', value: 'Checkout is broken' }],
          },
          then: [{ id: 'wait', type: 'delay', amount: 1, unit: 'days' }],
          else: [],
        },
      ],
    });

    await settle();

    const hook = createdHook();

    expect(githubCalls('POST', HOOKS)[0]?.auth).toBe('Bearer ghp_test_shop');
    expect(hook.name).toBe('web');
    expect(hook.active).toBe(true);
    expect(hook.events).toEqual(['issues']);
    expect(hook.config.url).toContain('/core/v1/integrations/hooks/');
    expect(hook.config.secret.length).toBeGreaterThan(20);
    expect(hook.config.content_type).toBe('json');

    const opened = issueEvent('opened');
    const ping = JSON.stringify({ zen: 'Keep it simple', hook_id: 42 });

    expect((await deliver('issues', 'd1', opened, 'not-the-secret')).status).toBe(401);
    expect((await deliver('ping', 'd2', ping)).status).toBe(200);
    expect((await deliver('issues', 'd3', issueEvent('closed'))).status).toBe(200);
    expect((await deliver('issues', 'd4', opened)).status).toBe(200);
    expect((await deliver('issues', 'd4', opened)).status).toBe(200);

    await settle();

    const runs = await t.runsOf(id);

    expect(runs).toHaveLength(1);
    const { steps } = await t.owner().automations.run({ runId: runs[0]?.id ?? '' });

    expect(steps.find((step) => step.stepId === 'check')?.output).toEqual({ matched: true });

    await t.owner().automations.pause({ id });
    await settle();

    expect(githubCalls('DELETE', `${HOOKS}/42`)).toHaveLength(1);
  });
});
