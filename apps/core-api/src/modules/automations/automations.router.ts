import { db } from '@erxes/core-db';
import { AUTOMATION_TEMPLATES } from '~/modules/automations/library';
import {
  activateAutomation,
  automationCatalog,
  automationFields,
  automationStats,
  listVersions,
  restoreVersion,
  startAutomation,
  testAutomation,
  cancelAutomationRun,
  createAutomation,
  getAutomation,
  getRun,
  listAutomations,
  listRuns,
  pauseAutomation,
  removeAutomation,
  retryAutomationRun,
  updateAutomation,
} from '~/modules/automations/automations.service';
import { authed } from '~/orpc';

export const automationsRouter = {
  catalog: authed.automations.catalog.handler(({ context }) =>
    automationCatalog(db(), context.actor.orgId),
  ),
  list: authed.automations.list.handler(({ input, context }) =>
    listAutomations(db(), context.actor, input),
  ),
  get: authed.automations.get.handler(({ input, context }) =>
    getAutomation(db(), context.actor, input.id),
  ),
  create: authed.automations.create.handler(({ input, context }) =>
    createAutomation(db(), context.actor, input),
  ),
  update: authed.automations.update.handler(({ input: { id, ...changes }, context }) =>
    updateAutomation(db(), context.actor, id, changes),
  ),
  activate: authed.automations.activate.handler(({ input, context }) =>
    activateAutomation(db(), context.actor, input.id),
  ),
  pause: authed.automations.pause.handler(({ input, context }) =>
    pauseAutomation(db(), context.actor, input.id),
  ),
  remove: authed.automations.remove.handler(({ input, context }) =>
    removeAutomation(db(), context.actor, input.id),
  ),
  start: authed.automations.start.handler(({ input, context }) =>
    startAutomation(db(), context.actor, input.id, input.subjects),
  ),
  test: authed.automations.test.handler(({ input: { id, ...rest }, context }) =>
    testAutomation(db(), context.actor, id, rest),
  ),
  stats: authed.automations.stats.handler(({ input, context }) =>
    automationStats(db(), context.actor, input.id),
  ),
  versions: authed.automations.versions.handler(({ input, context }) =>
    listVersions(db(), context.actor, input.id),
  ),
  restoreVersion: authed.automations.restoreVersion.handler(({ input, context }) =>
    restoreVersion(db(), context.actor, input.id, input.version),
  ),
  templates: authed.automations.templates.handler(() => ({ data: AUTOMATION_TEMPLATES })),
  fields: authed.automations.fields.handler(({ input, context }) =>
    automationFields(db(), context.actor, input.subject),
  ),
  runs: authed.automations.runs.handler(({ input, context }) =>
    listRuns(db(), context.actor, input),
  ),
  run: authed.automations.run.handler(({ input, context }) =>
    getRun(db(), context.actor, input.runId),
  ),
  retryRun: authed.automations.retryRun.handler(({ input, context }) =>
    retryAutomationRun(db(), context.actor, input.runId),
  ),
  cancelRun: authed.automations.cancelRun.handler(({ input, context }) =>
    cancelAutomationRun(db(), context.actor, input.runId),
  ),
};
