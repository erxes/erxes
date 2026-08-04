import { ActivityLogInput } from 'erxes-api-shared/core-modules';
import { ICompanyDocument } from 'erxes-api-shared/core-types';
import { buildCompanyTarget, getCompanyFieldLabel } from './utils';

export const buildCompanyFieldChangedActivity = (params: {
  company: ICompanyDocument;
  field: string;
  prev: unknown;
  current: unknown;
}): ActivityLogInput => {
  const { company, field, prev, current } = params;
  const fieldLabel = getCompanyFieldLabel(field);

  return {
    activityType: 'company.field_changed',
    target: buildCompanyTarget(company),
    action: {
      type: 'company.field_changed',
      description: `changed ${fieldLabel.toLowerCase()}`,
    },
    changes: {
      prev: { [field]: prev },
      current: { [field]: current },
    },
    metadata: { field, fieldLabel },
  };
};

export const buildCompanyTagActivities = (params: {
  company: ICompanyDocument;
  added: string[];
  removed: string[];
  addedLabels: string[];
  removedLabels: string[];
}): ActivityLogInput[] => {
  const { company, added, removed, addedLabels, removedLabels } = params;
  const activities: ActivityLogInput[] = [];

  if (added.length) {
    activities.push({
      activityType: 'company.tag_added',
      target: buildCompanyTarget(company),
      context: {
        moduleName: 'tags',
        collectionName: 'tags',
        text: addedLabels.join(', '),
      },
      action: { type: 'company.tag_added', description: 'added tag' },
      changes: { added: { ids: added, labels: addedLabels } },
      metadata: { entityLabel: 'tag' },
    });
  }

  if (removed.length) {
    activities.push({
      activityType: 'company.tag_removed',
      target: buildCompanyTarget(company),
      context: {
        moduleName: 'tags',
        collectionName: 'tags',
        text: removedLabels.join(', '),
      },
      action: { type: 'company.tag_removed', description: 'removed tag' },
      changes: { removed: { ids: removed, labels: removedLabels } },
      metadata: { entityLabel: 'tag' },
    });
  }

  return activities;
};
