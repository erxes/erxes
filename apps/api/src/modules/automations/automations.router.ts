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
import {
  automationCatalog,
  automationFields,
  definitionProblems,
} from '~/modules/automations/definitions';
import { testAutomation } from '~/modules/automations/dryRun';
import {
  automationStats,
  cancelAutomationRun,
  getRun,
  listRuns,
  retryAutomationRun,
  startAutomation,
} from '~/modules/automations/runs.service';
import { scoped } from '~/orpc';

export const automationsRouter = {
  catalog: scoped.automations.catalog.handler(() => automationCatalog(db())),
  list: scoped.automations.list.handler(({ input }) => listAutomations(db(), input)),
  get: scoped.automations.get.handler(({ input }) => getAutomation(db(), input.id)),
  create: scoped.automations.create.handler(({ input }) => createAutomation(db(), input)),
  update: scoped.automations.update.handler(({ input: { id, ...changes } }) =>
    updateAutomation(db(), id, changes),
  ),
  check: scoped.automations.check.handler(async ({ input }) => ({
    problems: await definitionProblems(db(), input.definition),
  })),
  activate: scoped.automations.activate.handler(({ input }) => activateAutomation(db(), input.id)),
  pause: scoped.automations.pause.handler(({ input }) => pauseAutomation(db(), input.id)),
  remove: scoped.automations.remove.handler(({ input }) => removeAutomation(db(), input.id)),
  start: scoped.automations.start.handler(({ input }) =>
    startAutomation(db(), input.id, input.subjects),
  ),
  test: scoped.automations.test.handler(({ input: { id, ...rest } }) =>
    testAutomation(db(), id, rest),
  ),
  stats: scoped.automations.stats.handler(({ input }) => automationStats(db(), input.id)),
  versions: scoped.automations.versions.handler(({ input }) => listVersions(db(), input.id)),
  restoreVersion: scoped.automations.restoreVersion.handler(({ input }) =>
    restoreVersion(db(), input.id, input.version),
  ),
  templates: scoped.automations.templates.handler(() => ({ data: AUTOMATION_TEMPLATES })),
  fields: scoped.automations.fields.handler(({ input }) => automationFields(db(), input.subject)),
  runs: scoped.automations.runs.handler(({ input }) => listRuns(db(), input)),
  run: scoped.automations.run.handler(({ input }) => getRun(db(), input.runId)),
  retryRun: scoped.automations.retryRun.handler(({ input }) =>
    retryAutomationRun(db(), input.runId),
  ),
  cancelRun: scoped.automations.cancelRun.handler(({ input }) =>
    cancelAutomationRun(db(), input.runId),
  ),
};
