import { test as setup } from '@playwright/test';
import { coreClient, OWNER, OWNER_STATE } from './fixtures';

// First-run setup on the fresh database, through the same endpoint the setup screen calls.
setup('the owner creates the organisation', async ({ request, baseURL }) => {
  const api = coreClient(request, baseURL);

  const { required } = await api.auth.setupStatus();

  // A rerun on the same local database signs in as the owner it made before.
  if (required) await api.auth.setup(OWNER);
  else await api.auth.signIn({ email: OWNER.email, password: OWNER.password });

  await api.auth.onboarded({ language: 'en' });
  await request.storageState({ path: OWNER_STATE });
});
