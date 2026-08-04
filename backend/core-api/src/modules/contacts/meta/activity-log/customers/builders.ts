import { ActivityLogInput } from 'erxes-api-shared/core-modules';
import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { buildCustomerTarget, getCustomerFieldLabel } from './utils';

export const buildCustomerFieldChangedActivity = (params: {
  customer: ICustomerDocument;
  field: string;
  prev: unknown;
  current: unknown;
  fieldLabel?: string;
  previousValueLabel?: string;
  currentValueLabel?: string;
}): ActivityLogInput => {
  const {
    customer,
    field,
    prev,
    current,
    fieldLabel,
    previousValueLabel,
    currentValueLabel,
  } = params;
  const resolvedFieldLabel = fieldLabel || getCustomerFieldLabel(field);

  return {
    activityType: 'customer.field_changed',
    target: buildCustomerTarget(customer),
    action: {
      type: 'customer.field_changed',
      description: `changed ${resolvedFieldLabel.toLowerCase()}`,
    },
    changes: {
      prev: { [field]: prev },
      current: { [field]: current },
    },
    metadata: {
      field,
      fieldLabel: resolvedFieldLabel,
      previousValueLabel,
      currentValueLabel,
    },
  };
};

export const buildCustomerTagActivities = (params: {
  customer: ICustomerDocument;
  added: string[];
  removed: string[];
  addedLabels: string[];
  removedLabels: string[];
}): ActivityLogInput[] => {
  const { customer, added, removed, addedLabels, removedLabels } = params;
  const activities: ActivityLogInput[] = [];

  if (added.length) {
    activities.push({
      activityType: 'customer.tag_added',
      target: buildCustomerTarget(customer),
      context: {
        moduleName: 'tags',
        collectionName: 'tags',
        text: addedLabels.join(', '),
      },
      action: {
        type: 'customer.tag_added',
        description: 'added tag',
      },
      changes: {
        added: {
          ids: added,
          labels: addedLabels,
        },
      },
      metadata: {
        entityLabel: 'tag',
      },
    });
  }

  if (removed.length) {
    activities.push({
      activityType: 'customer.tag_removed',
      target: buildCustomerTarget(customer),
      context: {
        moduleName: 'tags',
        collectionName: 'tags',
        text: removedLabels.join(', '),
      },
      action: {
        type: 'customer.tag_removed',
        description: 'removed tag',
      },
      changes: {
        removed: {
          ids: removed,
          labels: removedLabels,
        },
      },
      metadata: {
        entityLabel: 'tag',
      },
    });
  }

  return activities;
};
