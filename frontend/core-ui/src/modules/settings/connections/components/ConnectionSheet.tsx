import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlug, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Form,
  Sheet,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ConnectionForm } from '@/settings/connections/components/ConnectionForm';
import {
  connectionFormRows,
  connectionFormSchema,
  TConnectionForm,
  toConnectionFieldInputs,
} from '@/settings/connections/form';
import { useConnectionTypes } from '@/settings/connections/hooks/useConnections';
import {
  useConnectionsAdd,
  useConnectionsEdit,
  useConnectionsRemove,
  useConnectionsTest,
} from '@/settings/connections/hooks/useConnectionMutations';
import {
  connectionSheetAtom,
  TConnectionSheet,
} from '@/settings/connections/state';
import { IConnectionType } from '@/settings/connections/types';

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : undefined;

const ConnectionSheetForm = ({
  sheet,
  types,
  onClose,
}: {
  sheet: TConnectionSheet;
  types: IConnectionType[];
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'connections' });
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { addConnection, loading: adding } = useConnectionsAdd();
  const { editConnection, loading: saving } = useConnectionsEdit();
  const { removeConnection, loading: removing } = useConnectionsRemove();
  const { testConnection, loading: testing } = useConnectionsTest();
  const connection = sheet.mode === 'edit' ? sheet.connection : null;
  const initialType = connection?.type || types[0]?.id || '';

  const form = useForm<TConnectionForm>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      name: connection?.name || '',
      icon: connection?.icon || '',
      logo: connection?.logo || '',
      type: initialType,
      fields: connectionFormRows(
        types.find((type) => type.id === initialType),
        connection,
      ),
    },
  });

  const submit = async (values: TConnectionForm) => {
    const fields = toConnectionFieldInputs(values.fields);

    try {
      if (connection) {
        await editConnection(connection._id, {
          name: values.name,
          icon: values.icon || '',
          logo: values.logo || '',
          fields,
        });
        toast({ variant: 'success', title: t('saved-toast', 'Connection saved') });
      } else {
        await addConnection({
          name: values.name,
          ...(values.icon ? { icon: values.icon } : {}),
          ...(values.logo ? { logo: values.logo } : {}),
          type: values.type,
          fields,
        });
        toast({
          variant: 'success',
          title: t('created-toast', 'Connection created'),
        });
      }

      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save the connection'),
        description: errorMessage(error),
      });
    }
  };

  const remove = () => {
    if (!connection) {
      return;
    }

    confirm({
      message: t(
        'confirm-delete',
        'Delete {{name}}? Services using it stop working until they get another connection.',
        { name: connection.name },
      ),
    }).then(async () => {
      try {
        await removeConnection(connection._id);
        toast({
          variant: 'success',
          title: t('deleted-toast', 'Connection deleted'),
        });
        onClose();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t('delete-failed', 'Could not delete the connection'),
          description: errorMessage(error),
        });
      }
    });
  };

  const busy = adding || saving;

  return (
    <Form {...form}>
      <form
        className="flex size-full flex-col gap-0"
        onSubmit={form.handleSubmit(submit)}
      >
        <Sheet.Header>
          <IconPlug />
          <Sheet.Title>
            {connection
              ? t('edit-connection', 'Edit connection')
              : t('add-connection', 'Add connection')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex grow flex-col overflow-y-auto px-5 py-4">
          <ConnectionForm types={types} typeLocked={Boolean(connection)} />
        </Sheet.Content>
        <Sheet.Footer className="flex-wrap gap-2">
          {connection ? (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto text-destructive"
              disabled={removing}
              onClick={remove}
            >
              <IconTrash />
              {t('delete', 'Delete')}
            </Button>
          ) : null}
          {connection?.hasTest ? (
            <Button
              type="button"
              variant="outline"
              disabled={testing}
              onClick={() => testConnection(connection._id)}
              title={t('test-saved-values', 'Tests the saved values')}
            >
              {testing ? <Spinner /> : null}
              {t('test-connection', 'Test connection')}
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? <Spinner /> : null}
            {connection ? t('save', 'Save') : t('create', 'Create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const ConnectionSheet = () => {
  const [sheet, setSheet] = useAtom(connectionSheetAtom);
  const { types, loading } = useConnectionTypes();
  const close = () => setSheet(null);

  return (
    <Sheet open={Boolean(sheet)} onOpenChange={(open) => !open && close()}>
      <Sheet.View className="p-0 sm:max-w-xl">
        {sheet && loading ? (
          <div className="flex grow items-center justify-center">
            <Spinner />
          </div>
        ) : null}
        {sheet && !loading ? (
          <ConnectionSheetForm
            key={sheet.mode === 'edit' ? sheet.connection._id : 'create'}
            sheet={sheet}
            types={types}
            onClose={close}
          />
        ) : null}
      </Sheet.View>
    </Sheet>
  );
};
