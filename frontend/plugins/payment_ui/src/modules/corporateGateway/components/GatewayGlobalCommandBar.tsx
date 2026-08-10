import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, Separator, useConfirm, useToast } from 'erxes-ui';
import { gatewaySelectionAtom } from '~/modules/corporateGateway/states/gatewaySelection';

export const GatewayGlobalCommandBar = () => {
  const { t } = useTranslation('payment');
  const [selection, setSelection] = useAtom(gatewaySelectionAtom);
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const entries = Object.values(selection);
  const totalCount = entries.reduce((sum, entry) => sum + entry.ids.length, 0);

  const handleDelete = () => {
    confirm({
      message: t('remove-configs-confirm', { count: totalCount }),
    }).then(async () => {
      try {
        await Promise.all(
          entries.flatMap((entry) =>
            entry.ids.map((id) => entry.removeConfig(id)),
          ),
        );
        entries.forEach((entry) => entry.resetSelection());
        setSelection({});
        toast({
          title: t('configs-removed', { count: totalCount }),
          variant: 'success',
        });
      } catch (error: any) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <CommandBar open={totalCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', { count: totalCount })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
        >
          <IconTrash />
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};

export default GatewayGlobalCommandBar;
