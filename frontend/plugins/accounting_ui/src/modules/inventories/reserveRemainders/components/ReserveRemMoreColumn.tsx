import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Form,
  Popover,
  RecordTable,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useReserveRemEdit } from '../hooks/useReserveRemEdit';
import { useReserveRemsRemove } from '../hooks/useReserveRemsRemove';
import { IReserveRem } from '../types/ReserveRem';
import {
  RemainderFormField,
  ReserveRemFormFooter,
  ReserveRemSheet,
} from './ReserveRemFormParts';

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

  const labelOf = (parts: (string | undefined)[]) =>
    parts.filter(Boolean).join(' - ');

  return (
    <ReserveRemSheet
      open={open}
      onOpenChange={setOpen}
      title={t('edit-reserve-remainder')}
    >
      <Form {...form}>
        <form
          className="flex flex-col flex-auto overflow-auto"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="p-5 space-y-4">
            <ReadOnlyField
              label={t('product')}
              value={labelOf([reserveRem.product?.code, reserveRem.product?.name])}
            />
            <div className="grid grid-cols-2 gap-4">
              <ReadOnlyField
                label={t('branch')}
                value={labelOf([
                  reserveRem.branch?.code,
                  reserveRem.branch?.title,
                ])}
              />
              <ReadOnlyField
                label={t('department')}
                value={labelOf([
                  reserveRem.department?.code,
                  reserveRem.department?.title,
                ])}
              />
            </div>
            <ReadOnlyField label={t('uom')} value={reserveRem.uom ?? ''} />
            <RemainderFormField control={form.control} />
          </div>
          <ReserveRemFormFooter loading={loading} />
        </form>
      </Form>
    </ReserveRemSheet>
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
