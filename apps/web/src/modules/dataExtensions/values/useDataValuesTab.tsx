import { IconHierarchy2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { lazyPanelView } from '~/modules/side-panel/lazyPanelView';
import type { IRecordSidePanelTab } from '~/modules/side-panel/recordSidePanelTypes';
import { useFields } from '../dataQueries';

const FIELDS_TAB = 'fields';

// Loads with the tab, so the panels of records without fields carry none of its inputs.
const DataValuesPanel = lazyPanelView(
  async () => (await import('./DataValuesPanel')).DataValuesPanel,
);

/**
 * The Fields tab of a plugin's record whose UI doesn't edit them in core: its Data Extensions
 * values, read only. None while its type has no fields. `contentType` is the panel's
 * (`hr:employee`).
 */
export const useDataValuesTab = (contentType: string, recordId: string): IRecordSidePanelTab[] => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const recordType = contentType.replace(':', '.');
  const { fields } = useFields(recordType);

  if (!fields.length) return [];

  return [
    {
      value: FIELDS_TAB,
      label: t('fields', 'Fields'),
      icon: IconHierarchy2,
      content: <DataValuesPanel recordType={recordType} recordId={recordId} />,
    },
  ];
};
