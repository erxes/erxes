import { describe, expect, it } from 'vite-plus/test';
import { useBroadcasts } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

const DAY = 86_400_000;

const inDays = (days: number) => new Date(Date.now() + days * DAY).toISOString();

/** The broadcasts list by when each went or goes out, as the calendar reads a month. */
describe('broadcasts by date', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useBroadcasts();

  it('keeps those started or scheduled in the window, and drafts with no date out', async () => {
    const owner = t.owner();

    await t.customersIn('window', [{ firstName: 'Bat', primaryEmail: 'bat@window.mn' }]);

    const draft = await t.emailTo('window');
    const soon = await t.emailTo('window');
    const later = await t.emailTo('window');
    const sent = await t.emailTo('window');

    await owner.broadcasts.schedule({ id: soon.id, at: inDays(2) });
    await owner.broadcasts.schedule({ id: later.id, at: inDays(40) });
    await owner.broadcasts.send({ id: sent.id });
    await settle();

    const ids = async (input: { from?: string; to?: string; status?: 'scheduled' }) =>
      (await owner.broadcasts.list(input)).data.map((row) => row.id).toSorted();

    expect(await ids({ from: inDays(-1), to: inDays(3) })).toEqual([soon.id, sent.id].toSorted());
    expect(await ids({ from: inDays(1) })).toEqual([soon.id, later.id].toSorted());
    expect(await ids({ to: inDays(1) })).toEqual([sent.id]);
    expect(await ids({ from: inDays(-1), to: inDays(60), status: 'scheduled' })).toEqual(
      [soon.id, later.id].toSorted(),
    );
    expect(await ids({})).toContain(draft.id);

    await expect(owner.broadcasts.list({ from: 'yesterday' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
    });
    expect(await t.other().broadcasts.list({ from: inDays(-1), to: inDays(60) })).toMatchObject({
      data: [],
      totalCount: 0,
    });
  });
});
