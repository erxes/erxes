import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { archiveTargetState, selectedFieldIdsState } from '../states';
import { useCanManageFields } from '../usePropertyMutations';

export const PropertiesCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [selectedFieldIds, setSelectedFieldIds] = useAtom(selectedFieldIdsState);
  const setArchiveTarget = useSetAtom(archiveTargetState);
  const manager = useCanManageFields();
  const ids = Object.keys(selectedFieldIds);

  const handleBulkRemove = () => {
    setArchiveTarget({ kind: 'fields', ids, label: t('n-fields', '{{count}} fields', { count: ids.length }) });
    setSelectedFieldIds({});
  };

  return (
    <CommandBar open={ids.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('n-selected', '{{count}} selected', { count: ids.length })}</CommandBar.Value>
        {manager && (
          <Button variant="secondary" onClick={handleBulkRemove}>
            <IconTrash />
            {t('remove', 'Remove')}
          </Button>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
