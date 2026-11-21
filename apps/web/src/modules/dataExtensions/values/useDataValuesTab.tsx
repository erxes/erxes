import { IconDatabase } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { lazyPanelView } from '~/modules/side-panel/lazyPanelView';
import type { IRecordSidePanelTab } from '~/modules/side-panel/recordSidePanelTypes';
import { useFields } from '../dataQueries';

const DATA_TAB = 'data';

// Loads with the tab, so the panels of records without fields carry none of its inputs.
const DataValuesPanel = lazyPanelView(
  async () => (await import('./DataValuesPanel')).DataValuesPanel,
);

/**
 * The Data tab of a record in the side panel: its Data Extensions values. None while its type
 * has no fields. `contentType` is the panel's (`core:customer`, `hr:employee`).
 */
export const useDataValuesTab = (contentType: string, recordId: string): IRecordSidePanelTab[] => {
  const { t } = useTranslation('data', { keyPrefix: 'values' });
  const recordType = contentType.replace(':', '.');
  const { fields } = useFields(recordType);

  if (!fields.length) return [];

  return [
    {
      value: DATA_TAB,
      label: t('tab', 'Data'),
      icon: IconDatabase,
      content: <DataValuesPanel recordType={recordType} recordId={recordId} />,
    },
  ];
};
