import { db } from '@erxes/core-db';
import { convertLeads, leadHistory, moveLeads } from '~/modules/leads/leads.service';
import {
  createLeadStage,
  listLeadStages,
  removeLeadStage,
  reorderLeadStages,
  updateLeadStage,
} from '~/modules/leads/leadStages.service';
import { leadReport } from '~/modules/leads/report';
import { scoped } from '~/orpc';

export const leadsRouter = {
  stages: scoped.leads.stages.handler(() => listLeadStages(db())),
  createStage: scoped.leads.createStage.handler(({ input }) => createLeadStage(db(), input)),
  updateStage: scoped.leads.updateStage.handler(({ input: { id, ...changes } }) =>
    updateLeadStage(db(), id, changes),
  ),
  reorderStages: scoped.leads.reorderStages.handler(({ input }) =>
    reorderLeadStages(db(), input.ids),
  ),
  removeStage: scoped.leads.removeStage.handler(({ input }) =>
    removeLeadStage(db(), input.id, input.moveTo),
  ),
  move: scoped.leads.move.handler(({ input }) => moveLeads(db(), input)),
  convert: scoped.leads.convert.handler(({ input }) => convertLeads(db(), input)),
  history: scoped.leads.history.handler(({ input }) => leadHistory(db(), input)),
  report: scoped.leads.report.handler(({ input }) => leadReport(db(), input)),
};
