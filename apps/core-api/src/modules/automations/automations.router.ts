import { db } from '@erxes/core-db';
import { AUTOMATION_TEMPLATES } from '~/modules/automations/library';
import {
  activateAutomation,
  createAutomation,
  getAutomation,
  listAutomations,
  listVersions,
  pauseAutomation,
  removeAutomation,
  restoreVersion,
  updateAutomation,
} from '~/modules/automations/automations.service';
import { automationCatalog, automationFields } from '~/modules/automations/definitions';
import { testAutomation } from '~/modules/automations/dryRun';
import {
  automationStats,
  cancelAutomationRun,
  getRun,
  listRuns,
  retryAutomationRun,
  startAutomation,
} from '~/modules/automations/runs.service';
import { authed } from '~/orpc';

export const automationsRouter = {
  catalog: authed.automations.catalog.handler(() => automationCatalog(db())),
  list: authed.automations.list.handler(({ input }) => listAutomations(db(), input)),
  get: authed.automations.get.handler(({ input }) => getAutomation(db(), input.id)),
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
  test: authed.automations.test.handler(({ input: { id, ...rest } }) =>
    testAutomation(db(), id, rest),
  ),
  stats: authed.automations.stats.handler(({ input }) => automationStats(db(), input.id)),
  versions: authed.automations.versions.handler(({ input }) => listVersions(db(), input.id)),
  restoreVersion: authed.automations.restoreVersion.handler(({ input, context }) =>
    restoreVersion(db(), context.actor, input.id, input.version),
  ),
  templates: authed.automations.templates.handler(() => ({ data: AUTOMATION_TEMPLATES })),
  fields: authed.automations.fields.handler(({ input }) => automationFields(db(), input.subject)),
  runs: authed.automations.runs.handler(({ input }) => listRuns(db(), input)),
  run: authed.automations.run.handler(({ input }) => getRun(db(), input.runId)),
  retryRun: authed.automations.retryRun.handler(({ input }) =>
    retryAutomationRun(db(), input.runId),
  ),
  cancelRun: authed.automations.cancelRun.handler(({ input }) =>
    cancelAutomationRun(db(), input.runId),
  ),
};
