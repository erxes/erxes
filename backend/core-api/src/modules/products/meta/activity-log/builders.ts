import { ActivityLogInput } from 'erxes-api-shared/core-modules';
import { IProductDocument } from 'erxes-api-shared/core-types';
import { buildProductTarget, getProductFieldLabel } from './utils';

export const buildProductFieldChangedActivity = (params: {
  product: IProductDocument;
  field: string;
  prev: unknown;
  current: unknown;
}): ActivityLogInput => {
  const { product, field, prev, current } = params;
  const fieldLabel = getProductFieldLabel(field);

  return {
    activityType: 'product.field_changed',
    target: buildProductTarget(product),
    action: {
      type: 'product.field_changed',
      description: `changed ${fieldLabel.toLowerCase()}`,
    },
    changes: {
      prev: { [field]: prev },
      current: { [field]: current },
    },
    metadata: { field, fieldLabel },
  };
};

export const buildProductDescriptionChangedActivity = (params: {
  product: IProductDocument;
  prev: unknown;
  current: unknown;
}): ActivityLogInput => {
  const { product, prev, current } = params;

  return {
    activityType: 'description_change',
    target: buildProductTarget(product),
    action: {
      type: 'updated',
      description: !prev ? 'set description' : 'changed description',
    },
    changes: { prev, current },
    metadata: { field: 'description' },
  };
};

export const buildProductTagActivities = (params: {
  product: IProductDocument;
  added: string[];
  removed: string[];
  addedLabels: string[];
  removedLabels: string[];
}): ActivityLogInput[] => {
  const { product, added, removed, addedLabels, removedLabels } = params;
  const activities: ActivityLogInput[] = [];

  if (added.length) {
    activities.push({
      activityType: 'product.tag_added',
      target: buildProductTarget(product),
      context: {
        moduleName: 'core',
        collectionName: 'tags',
        text: addedLabels.join(', '),
      },
      action: { type: 'product.tag_added', description: 'added tag' },
      changes: { added: { ids: added, labels: addedLabels } },
      metadata: { entityLabel: 'tag' },
    });
  }

  if (removed.length) {
    activities.push({
      activityType: 'product.tag_removed',
      target: buildProductTarget(product),
      context: {
        moduleName: 'core',
        collectionName: 'tags',
        text: removedLabels.join(', '),
      },
      action: { type: 'product.tag_removed', description: 'removed tag' },
      changes: { removed: { ids: removed, labels: removedLabels } },
      metadata: { entityLabel: 'tag' },
    });
  }

  return activities;
};
