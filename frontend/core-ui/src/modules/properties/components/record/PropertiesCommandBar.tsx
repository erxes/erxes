import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, useConfirm, useToast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { useFieldsBulkRemove } from '../../hooks/useFieldsBulkRemove';
import { selectedFieldIdsState } from '../../states/selectedFieldsState';

export const PropertiesCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [selectedFieldIds, setSelectedFieldIds] = useAtom(
    selectedFieldIdsState,
  );
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeFields, loading } = useFieldsBulkRemove();
  const ids = Object.keys(selectedFieldIds);

  const handleBulkDelete = () => {
    confirm({
      message: t(
        'confirm-delete-fields',
        'Are you sure you want to delete the {{count}} selected field(s)?',
        { count: ids.length },
      ),
    }).then(async () => {
      try {
        await removeFields(ids);
        setSelectedFieldIds({});
        toast({
          title: 'Success',
          variant: 'success',
          description: t(
            'fields-deleted',
            'Fields deleted successfully',
          ),
        });
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <CommandBar open={ids.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', '{{count}} selected', {
            count: ids.length,
          })}
        </CommandBar.Value>
        <Can action="fieldsManage">
          <Button
            variant="secondary"
            className="text-destructive"
            disabled={loading}
            onClick={handleBulkDelete}
          >
            <IconTrash />
            {t('delete', 'Delete')}
          </Button>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
