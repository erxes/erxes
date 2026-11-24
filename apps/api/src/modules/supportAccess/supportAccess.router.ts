import { db } from '@erxes/core-db';
import { audited, scoped } from '~/orpc';
import {
  activeVisits,
  endVisit,
  listVisits,
  supportAccessSettings,
  updateSupportAccess,
} from './visits';

export const supportAccessRouter = {
  settings: scoped.supportAccess.settings.handler(() => supportAccessSettings(db())),
  updateSettings: scoped.supportAccess.updateSettings.handler(({ input }) =>
    updateSupportAccess(db(), input),
  ),
  visits: scoped.supportAccess.visits.handler(({ input }) => listVisits(db(), input)),
  active: scoped.supportAccess.active.handler(() => activeVisits(db())),
  endVisit: scoped.supportAccess.endVisit.handler(({ input }) =>
    audited(
      (tx) => endVisit(tx, input.id),
      (visit) => ({
        action: 'support.visit_ended',
        targetType: 'support_visit',
        targetId: visit.id,
        targetLabel: visit.staffName,
      }),
    ),
  ),
};
