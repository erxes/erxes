import { TRelationEntity, useRelationWidgetTabs } from 'ui-modules';

/** Keeps contact links in core details and other modules in Relations. */
export const useRecordRelationTabs = ({
  record,
  access,
  hasCoreViews,
  isPluginRecord,
}: {
  record: TRelationEntity;
  access: 'read' | 'write';
  hasCoreViews: boolean;
  isPluginRecord: boolean;
}) =>
  useRelationWidgetTabs({
    ...record,
    access,
    hiddenModules: hasCoreViews ? ['customer', 'company'] : [],
    skip: isPluginRecord,
  });
