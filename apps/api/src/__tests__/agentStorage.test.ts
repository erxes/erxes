import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { registerStorageConformance } from '@earendil-works/pi-durable/testing';
import { newId } from '@erxes/core-db';
import { describe, expect, it } from 'vite-plus/test';
import { openAgentStorage, StorageBusy } from '~/modules/agents/storage';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('agent storage', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  // pi-durable's own suite: commits, ids, documents, tasks and reads behave as pi expects.
  registerStorageConformance({ describe, expect, it }, 'core_agent_*', async (use) => {
    const storage = await openAgentStorage(t.ids.org, `conformance:${newId()}`);

    try {
      await use(storage);
    } finally {
      await storage.close(BACKGROUND_CONTEXT);
    }
  });

  it('lets one server at a time run a storage, and no other organisation', async () => {
    const key = `lease:${newId()}`;
    const first = await openAgentStorage(t.ids.org, key);

    await expect(openAgentStorage(t.ids.org, key)).rejects.toBeInstanceOf(StorageBusy);
    await first.close(BACKGROUND_CONTEXT);

    const again = await openAgentStorage(t.ids.org, key);

    await again.close(BACKGROUND_CONTEXT);
    await expect(openAgentStorage(t.ids.otherOrg, key)).rejects.toBeInstanceOf(StorageBusy);
  });
});
