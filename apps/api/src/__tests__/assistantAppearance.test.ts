import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const DEFAULT = { body: 'circle', color: 'ink', expression: 'neutral' };

describe('assistant appearance', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('starts every member on the default look', async () => {
    expect(await t.member().assistant.appearance({})).toEqual(DEFAULT);
    expect(await t.other().assistant.appearance({})).toEqual(DEFAULT);
  });

  it('keeps each member’s choice to that member', async () => {
    const chosen = { body: 'cloud', color: 'teal', expression: 'curious' } as const;

    expect(await t.member().assistant.updateAppearance(chosen)).toEqual(chosen);
    expect(await t.member().assistant.appearance({})).toEqual(chosen);
    expect(await t.owner().assistant.appearance({})).toEqual(DEFAULT);
    expect(await t.other().assistant.appearance({})).toEqual(DEFAULT);

    const changed = { ...chosen, expression: 'happy' } as const;

    expect(await t.member().assistant.updateAppearance(changed)).toEqual(changed);
    expect(await t.member().assistant.appearance({})).toEqual(changed);
  });

  it('refuses a look the avatar does not have', async () => {
    const response = await fetch(t.url('/core/v1/assistant/appearance'), {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${await t.token(t.ids.member)}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ body: 'star', color: 'ink', expression: 'neutral' }),
    });

    expect(response.status).toBe(400);
    expect(await t.member().assistant.appearance({})).not.toMatchObject({ body: 'star' });
  });
});
