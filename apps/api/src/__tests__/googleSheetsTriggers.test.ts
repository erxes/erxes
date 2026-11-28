import { integrationSubscriptions } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { SESSION_COOKIE } from '~/http/cookies';
import { pollSchedule } from '~/modules/integrations/polls';
import { useAutomations } from './automations.fixture';
import { adminDb, useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { settle } from './settle';

const SPREADSHEET = '1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-sheet';

const GOOGLE = [
  'https://accounts.google.com/',
  'https://oauth2.googleapis.com/',
  'https://sheets.googleapis.com/',
  'https://www.googleapis.com/',
];

const pollNow = async () => {
  await adminDb()
    .update(integrationSubscriptions)
    .set({ nextPollAt: sql`now() - interval '1 minute'` });
  await pollSchedule.queues[0]?.run();
  await settle();
};

const connectionIn = (location: string | null) =>
  new URL(location ?? '', 'http://x').searchParams.get('connected') ?? '';

const nameIs = (id: string, name: string, email: string) => ({
  id,
  type: 'branch' as const,
  conditions: {
    match: 'all' as const,
    rules: [
      { path: 'event.payload.Name', op: 'eq' as const, value: name },
      { path: 'event.payload.Email', op: 'eq' as const, value: email },
    ],
  },
  then: [],
  else: [],
});

describe('Google Sheets triggers', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const tokens: Record<string, unknown> = {
    access_token: 'ya29.first',
    refresh_token: '1//refresh-first',
    expires_in: 3600,
  };

  const sheet = {
    values: [
      ['Name', 'Email'],
      ['Bat', 'bat@acme.mn'],
    ],
  };

  const google = fakeGateway([
    ['POST https://oauth2.googleapis.com/token', tokens],
    ['GET https://www.googleapis.com/oauth2/v3/userinfo', { sub: '1170', email: 'sales@acme.mn' }],
    [
      'GET https://www.googleapis.com/drive/v3/files',
      { files: [{ id: SPREADSHEET, name: 'Leads' }] },
    ],
    [`GET https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET}/values/`, sheet],
    [
      `GET https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET}?fields=`,
      {
        properties: { title: 'Leads' },
        sheets: [
          { properties: { sheetId: 0, title: 'Sheet1' } },
          { properties: { sheetId: 7, title: 'Ops' } },
        ],
      },
    ],
  ]);

  const tokenRequests = () =>
    google.calls
      .filter((call) => call.url === 'https://oauth2.googleapis.com/token')
      .map((call) => new URLSearchParams(call.body));

  const sheetReads = () => google.calls.filter((call) => call.url.includes('sheets.googleapis'));

  const signIn = async (name: string) => {
    const { url } = await t.owner().integrations.authorize({ key: 'googlesheets', name });
    const state = new URL(url).searchParams.get('state') ?? '';

    const back = await fetch(
      t.url(`/core/v1/integrations/oauth/callback?code=code-${name}&state=${state}`),
      { redirect: 'manual', headers: { cookie: `${SESSION_COOKIE}=${await t.token()}` } },
    );

    return { url: new URL(url), back };
  };

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      GOOGLE.some((host) => urlOf(input).startsWith(host))
        ? google.fetch(input, init)
        : realFetch(input, init),
    );

    await t.owner().integrations.setOAuthApp({
      key: 'googlesheets',
      clientId: 'acme-client.apps.googleusercontent.com',
      clientSecret: 'acme-client-secret',
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  let connectionId = '';
  let opsAutomation = '';

  it('signs in with the organisation’s own Google app and keeps the tokens out of the connection list', async () => {
    const { url, back } = await signIn('Sales');

    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('client_id')).toBe('acme-client.apps.googleusercontent.com');
    expect(url.searchParams.get('redirect_uri')).toContain('/core/v1/integrations/oauth/callback');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('scope')?.split(' ')).toEqual(
      expect.arrayContaining([
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
      ]),
    );

    const [exchange] = tokenRequests();

    expect(exchange?.get('grant_type')).toBe('authorization_code');
    expect(exchange?.get('code')).toBe('code-Sales');
    expect(exchange?.get('code_verifier')).toBeTruthy();
    expect(exchange?.get('client_secret')).toBe('acme-client-secret');

    expect(back.status).toBe(302);
    expect(back.headers.get('location')).toContain(
      '/settings/integrations/googlesheets?connected=',
    );

    connectionId = connectionIn(back.headers.get('location'));

    const { data } = await t.owner().integrations.connections({ key: 'googlesheets' });

    expect(data.map((row) => [row.id, row.settings.account])).toEqual([
      [connectionId, 'sales@acme.mn'],
    ]);
    expect(JSON.stringify(data)).not.toMatch(/ya29|refresh-first/);

    const forged = await fetch(
      t.url('/core/v1/integrations/oauth/callback?code=stolen&state=e30.forged'),
      { redirect: 'manual' },
    );

    expect(forged.status).toBe(400);
  });

  const records = (recordType: string, extra: { search?: string; parents?: string[] } = {}) =>
    t.owner().integrations.records({ key: 'googlesheets', recordType, ...extra });

  it('lists the account’s spreadsheets by name, newest first or by what was typed, and a spreadsheet’s sheets', async () => {
    expect((await records('spreadsheet')).data).toEqual([{ value: SPREADSHEET, label: 'Leads' }]);

    await records('spreadsheet', { search: "bat's leads" });

    const queries = google.calls
      .filter((call) => call.url.startsWith('https://www.googleapis.com/drive/v3/files'))
      .map((call) => new URL(call.url).searchParams);

    expect(queries[0]?.get('orderBy')).toBe('modifiedTime desc');
    expect(queries[1]?.get('q')).toBe(
      String.raw`mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and name contains 'bat\'s leads'`,
    );

    expect(
      (await records('sheet', { parents: [SPREADSHEET] })).data.map((row) => row.label),
    ).toEqual(['Sheet1', 'Ops']);
  });

  it('a new row starts one run with its cells; the first poll and an unchanged sheet start none', async () => {
    const id = await t.active('Welcome new leads', {
      trigger: {
        kind: 'app',
        app: 'googlesheets',
        trigger: 'row_added',
        connectionId,
        params: { spreadsheet: `https://docs.google.com/spreadsheets/d/${SPREADSHEET}/edit#gid=0` },
      },
      steps: [nameIs('dana', 'Dana', 'dana@acme.mn'), nameIs('tuya', 'Tuya', 'tuya@acme.mn')],
    });

    await settle();
    await pollNow();

    expect(sheetReads().at(-1)?.auth).toBe('Bearer ya29.first');
    expect(await t.runsOf(id)).toHaveLength(0);

    sheet.values.push(['Dana', 'dana@acme.mn'], ['Tuya', 'tuya@acme.mn']);
    await pollNow();

    const runs = await t.runsOf(id);

    expect(runs).toHaveLength(2);

    const outputs = await Promise.all(
      runs.map(async (run) => {
        const { steps } = await t.owner().automations.run({ runId: run.id });

        return Object.fromEntries(
          steps.map((step): [string, unknown] => [step.stepId, step.output]),
        );
      }),
    );

    expect(outputs).toEqual(
      expect.arrayContaining([
        { dana: { matched: true }, tuya: { matched: false } },
        { dana: { matched: false }, tuya: { matched: true } },
      ]),
    );

    await pollNow();

    expect(await t.runsOf(id)).toHaveLength(2);
  });

  it('renews an expired sign-in through the token URL before it reads the sheet', async () => {
    Object.assign(tokens, {
      access_token: 'ya29.short',
      refresh_token: '1//refresh-short',
      expires_in: 30,
    });

    const { back } = await signIn('Ops');
    const opsId = connectionIn(back.headers.get('location'));

    Object.assign(tokens, { access_token: 'ya29.renewed', expires_in: 3600 });
    Reflect.deleteProperty(tokens, 'refresh_token');

    opsAutomation = await t.active('Watch ops sheet', {
      trigger: {
        kind: 'app',
        app: 'googlesheets',
        trigger: 'row_added_or_changed',
        connectionId: opsId,
        params: { spreadsheet: SPREADSHEET, sheet: 'Ops' },
      },
      steps: [{ id: 'wait', type: 'delay', amount: 1, unit: 'days' }],
    });

    await settle();

    const before = tokenRequests().length;

    await pollNow();

    const renewals = tokenRequests().slice(before);

    expect(renewals.map((form) => form.get('grant_type'))).toEqual(['refresh_token']);
    expect(renewals[0]?.get('refresh_token')).toBe('1//refresh-short');
    expect(renewals[0]?.get('client_secret')).toBe('acme-client-secret');

    const opsRead = sheetReads().findLast((call) => call.url.includes(encodeURIComponent("'Ops'")));

    expect(opsRead?.auth).toBe('Bearer ya29.renewed');

    await pollNow();

    expect(tokenRequests()).toHaveLength(before + 1);
    expect(await t.runsOf(opsAutomation)).toHaveLength(0);
  });

  it('an edited cell starts one run on "Row added or changed"; deleting a row above others starts none', async () => {
    sheet.values[2] = ['Dana', 'dana@shop.mn'];
    await pollNow();

    const runs = await t.runsOf(opsAutomation);

    expect(runs).toHaveLength(1);

    sheet.values.splice(1, 1);
    await pollNow();

    expect(await t.runsOf(opsAutomation)).toHaveLength(1);
  });

  it('a row edited back and forth starts a run on every edit; polling it unchanged starts none', async () => {
    sheet.values[1] = ['Dana', 'dana@acme.mn'];
    await pollNow();
    sheet.values[1] = ['Dana', 'dana@shop.mn'];
    await pollNow();
    sheet.values[1] = ['Dana', 'dana@acme.mn'];
    await pollNow();

    expect(await t.runsOf(opsAutomation)).toHaveLength(4);

    await pollNow();
    await pollNow();

    expect(await t.runsOf(opsAutomation)).toHaveLength(4);
  });
});
