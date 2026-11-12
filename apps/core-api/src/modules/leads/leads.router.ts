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
import { authed } from '~/orpc';

export const leadsRouter = {
  stages: authed.leads.stages.handler(({ context }) => listLeadStages(db(), context.actor)),
  createStage: authed.leads.createStage.handler(({ input, context }) =>
    createLeadStage(db(), context.actor, input),
  ),
  updateStage: authed.leads.updateStage.handler(({ input: { id, ...changes }, context }) =>
    updateLeadStage(db(), context.actor, id, changes),
  ),
  reorderStages: authed.leads.reorderStages.handler(({ input, context }) =>
    reorderLeadStages(db(), context.actor, input.ids),
  ),
  removeStage: authed.leads.removeStage.handler(({ input, context }) =>
    removeLeadStage(db(), context.actor, input.id, input.moveTo),
  ),
  move: authed.leads.move.handler(({ input, context }) => moveLeads(db(), context.actor, input)),
  convert: authed.leads.convert.handler(({ input, context }) =>
    convertLeads(db(), context.actor, input),
  ),
  history: authed.leads.history.handler(({ input, context }) =>
    leadHistory(db(), context.actor, input),
  ),
  report: authed.leads.report.handler(({ input, context }) =>
    leadReport(db(), context.actor, input),
  ),
};
