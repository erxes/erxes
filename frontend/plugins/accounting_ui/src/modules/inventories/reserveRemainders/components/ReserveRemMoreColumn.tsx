import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Button,
  Combobox,
  Command,
  Form,
  Input,
  Popover,
  RecordTable,
  ScrollArea,
  Sheet,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useReserveRemEdit } from '../hooks/useReserveRemEdit';
import { useReserveRemsRemove } from '../hooks/useReserveRemsRemove';
import { IReserveRem } from '../types/ReserveRem';

const ReserveRemMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IReserveRem, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const { removeReserveRems } = useReserveRemsRemove();
  const [editOpen, setEditOpen] = useState(false);

  const reserveRem = cell.row.original;

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      removeReserveRems({
        variables: { _ids: [reserveRem._id] },
      });
    });

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={() => setEditOpen(true)}>
                <IconEdit /> {t('edit')}
              </Command.Item>
              <Command.Item value="delete" onSelect={handleDelete}>
                <IconTrash /> {t('delete')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <EditReserveRemSheet
        open={editOpen}
        setOpen={setEditOpen}
        reserveRem={reserveRem}
      />
    </>
  );
};

type TEditForm = { remainder: number };

const EditReserveRemSheet = ({
  open,
  setOpen,
  reserveRem,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  reserveRem: IReserveRem;
}) => {
  const { t } = useTranslation('accounting');
  const { editReserveRem, loading } = useReserveRemEdit();
  const form = useForm<TEditForm>({
    values: { remainder: reserveRem.remainder ?? 0 },
  });

  const onSubmit = (data: TEditForm) => {
    editReserveRem({
      variables: { _id: reserveRem._id, remainder: data.remainder },
      onCompleted: () => setOpen(false),
    });
  };

  const productLabel = [reserveRem.product?.code, reserveRem.product?.name]
    .filter(Boolean)
    .join(' - ');
  const branchLabel = [reserveRem.branch?.code, reserveRem.branch?.title]
    .filter(Boolean)
    .join(' - ');
  const departmentLabel = [
    reserveRem.department?.code,
    reserveRem.department?.title,
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>{t('edit-reserve-remainder')}</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {t('edit-reserve-remainder')}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <Form {...form}>
              <form
                className="flex flex-col flex-auto overflow-auto"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="p-5 space-y-4">
                  <ReadOnlyField label={t('product')} value={productLabel} />
                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField label={t('branch')} value={branchLabel} />
                    <ReadOnlyField
                      label={t('department')}
                      value={departmentLabel}
                    />
                  </div>
                  <ReadOnlyField
                    label={t('uom')}
                    value={reserveRem.uom ?? ''}
                  />
                  <Form.Field
                    control={form.control}
                    name="remainder"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('reserve-remainder')}</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
                <Sheet.Footer className="p-5 border-t bg-muted/30">
                  <Sheet.Close asChild>
                    <Button variant="outline" type="button" size="lg">
                      {t('cancel')}
                    </Button>
                  </Sheet.Close>
                  <Button type="submit" size="lg" disabled={loading}>
                    {loading && <Spinner />}
                    {t('save')}
                  </Button>
                </Sheet.Footer>
              </form>
            </Form>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

const ReadOnlyField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="space-y-1">
    <p className="text-sm font-medium">{label}</p>
    <p className="text-sm text-muted-foreground break-all">{value || '-'}</p>
  </div>
);

export const reserveRemMoreColumn = {
  id: 'more',
  cell: ReserveRemMoreColumnCell,
  size: 33,
};
