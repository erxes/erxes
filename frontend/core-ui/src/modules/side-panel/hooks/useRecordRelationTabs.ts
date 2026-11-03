import { TRelationEntity, useRelationWidgetTabs } from 'ui-modules';

const CONTACT_HIDDEN_MODULES: Record<string, string[]> = {
  'core:customer': ['customer'],
  'core:company': ['company'],
};

/** Keeps reciprocal contacts visible while preserving other record relation rules. */
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
    hiddenModules: hasCoreViews
      ? CONTACT_HIDDEN_MODULES[record.contentType] || ['customer', 'company']
      : [],
    skip: isPluginRecord,
  });
