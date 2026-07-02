import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Form,
  Input,
  Popover,
  RecordTable,
  Sheet,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { Control, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments, SelectProduct } from 'ui-modules';
import { useReserveRemEdit } from '../hooks/useReserveRemEdit';
import { useReserveRemsRemove } from '../hooks/useReserveRemsRemove';
import { IReserveRem } from '../types/ReserveRem';
import {
  RemainderFormField,
  ReserveRemFormFooter,
} from './ReserveRemFormParts';
import { AccountingSheet } from '~/modules/layout/components/Sheet';

type TEditForm = {
  branchId?: string;
  departmentId?: string;
  productId?: string;
  uom?: string;
  remainder: number;
};

/** edit reserve remainder form fields. */
const EditReserveRemFields = ({ control }: { control: Control<TEditForm> }) => {
  const { t } = useTranslation('accounting');
  return (
    <div className="p-5 space-y-4 min-h-0 flex-1 overflow-y-auto">
      <Form.Field
        control={control}
        name="productId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('product')}</Form.Label>
            <SelectProduct.FormItem
              mode="single"
              value={field.value}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={control}
          name="branchId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('branch')}</Form.Label>
              <SelectBranches.FormItem
                mode="single"
                value={field.value}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="departmentId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('department')}</Form.Label>
              <SelectDepartments.FormItem
                mode="single"
                value={field.value}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <Form.Field
        control={control}
        name="uom"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('uom')}</Form.Label>
            <Form.Control>
              <Input {...field} value={field.value ?? ''} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <RemainderFormField control={control} />
    </div>
  );
};
/** ene reserve remainder edit sheet. */
const EditReserveRemSheet = ({
  setOpen,
  reserveRem,
}: {
  setOpen: (open: boolean) => void;
  reserveRem: IReserveRem;
}) => {
  const { t } = useTranslation('accounting');
  const { editReserveRem, loading } = useReserveRemEdit();
  const form = useForm<TEditForm>({
    values: {
      branchId: reserveRem.branchId,
      departmentId: reserveRem.departmentId,
      productId: reserveRem.productId,
      uom: reserveRem.uom,
      remainder: reserveRem.remainder ?? 0,
    },
  });

  /** ene edit save hiigeed sheet haana. */
  const onSubmit = (data: TEditForm) => {
    editReserveRem({
      variables: { _id: reserveRem._id, ...data },
      onCompleted: () => setOpen(false),
    });
  };

  return (
    <AccountingSheet title={t('edit-reserve-remainder')}>
      <Form {...form}>
        <form
          className="flex flex-col flex-1 bg-background min-h-0"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <EditReserveRemFields control={form.control} />
          <ReserveRemFormFooter loading={loading} />
        </form>
      </Form>
    </AccountingSheet>
  );
};

/** ene edit/delete menu. */
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

  /** ene delete confirm hiigeed ustgana. */
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

  const actionsMenu = (
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
  );

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        {actionsMenu}
      </Popover>
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        {editOpen && (
          <EditReserveRemSheet setOpen={setEditOpen} reserveRem={reserveRem} />
        )}
      </Sheet>
    </>
  );
};

export const reserveRemMoreColumn = {
  id: 'more',
  cell: ReserveRemMoreColumnCell,
  size: 33,
};
