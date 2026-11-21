import { db, requestOrgId, withOrg } from '@erxes/core-db';
import { audited, recordOf, scoped, unscoped } from '~/orpc';
import { runAction } from './actions';
import { runIncoming } from './incoming';
import {
  createIntegration,
  getIntegration,
  listIntegrations,
  removeIntegration,
  setIntegrationSecrets,
  updateIntegration,
} from './integrations.service';
import {
  loadProgram,
  programVersions,
  removeProgram,
  restoreProgram,
  saveProgram,
} from './programs.service';

export const integrationsRouter = {
  list: scoped.integrations.list.handler(() => listIntegrations(db())),
  get: scoped.integrations.get.handler(({ input }) => getIntegration(db(), input.id)),
  create: scoped.integrations.create.handler(({ input }) =>
    audited(
      (tx) => createIntegration(tx, input),
      (integration) => ({
        ...recordOf('integration', 'created', integration.id, integration),
        metadata: { hosts: integration.hosts },
      }),
    ),
  ),
  update: scoped.integrations.update.handler(({ input: { id, ...changes } }) =>
    audited(
      (tx) => updateIntegration(tx, id, changes),
      (integration) => ({
        ...recordOf('integration', 'updated', id, integration),
        metadata: changes,
      }),
    ),
  ),
  setSecrets: scoped.integrations.setSecrets.handler(({ input }) =>
    audited(
      (tx) => setIntegrationSecrets(tx, input.id, input.secrets),
      (integration) => ({
        ...recordOf('integration', 'secrets_changed', input.id, integration),
        metadata: { names: Object.keys(input.secrets) },
      }),
    ),
  ),
  remove: scoped.integrations.remove.handler(({ input }) =>
    audited(
      (tx) => removeIntegration(tx, input.id),
      () => recordOf('integration', 'deleted', input.id),
    ),
  ),
  saveProgram: scoped.integrations.saveProgram.handler(({ input }) =>
    audited(
      (tx) => saveProgram(tx, input),
      (program) => ({
        ...recordOf('integration_program', 'saved', program.id, program),
        metadata: { kind: program.kind, key: program.key, version: program.version },
      }),
    ),
  ),
  removeProgram: scoped.integrations.removeProgram.handler(({ input }) =>
    audited(
      (tx) => removeProgram(tx, input.id),
      () => recordOf('integration_program', 'deleted', input.id),
    ),
  ),
  programVersions: scoped.integrations.programVersions.handler(({ input }) =>
    programVersions(db(), input.id),
  ),
  restoreProgram: scoped.integrations.restoreProgram.handler(({ input }) =>
    audited(
      (tx) => restoreProgram(tx, input.id, input.version),
      (program) => ({
        ...recordOf('integration_program', 'restored', program.id, program),
        metadata: { from: input.version, version: program.version },
      }),
    ),
  ),
  testProgram: unscoped.integrations.testProgram.handler(async ({ input }) => {
    const loaded = await withOrg(requestOrgId(), (tx) => loadProgram(tx, input.id));

    return loaded.program.kind === 'incoming'
      ? runIncoming(loaded, input.incoming)
      : runAction(requestOrgId(), loaded, {
          input: input.input,
          idempotencyKey: `test:${input.id}`,
        });
  }),
};
