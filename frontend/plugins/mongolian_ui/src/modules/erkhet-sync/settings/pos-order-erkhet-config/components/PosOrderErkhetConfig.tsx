import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconAt,
  IconBuildingStore,
  IconHash,
  IconPlus,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Button,
  Checkbox,
  Form,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Select,
  Sheet,
} from 'erxes-ui';
import { checkboxColumn } from 'erxes-ui/modules/record-table/components/CheckboxColumn';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SelectPos } from '@/ebarimt/settings/pos-in-ebarimt-config/components/selects/SelectPos';
import { DEFAULT_PAY_DATA } from '../../stage-in-erkhet-config/constants/defaultPayData';
import { TPos, TPosOrderErkhetConfig } from '../hooks/usePosOrderErkhetConfigs';
import { ErkhetConfigRecordTable } from '../../shared/components/ErkhetConfigRecordTable';
import { ErkhetConfigCommandBar } from '../../shared/components/ErkhetConfigCommandBar';
import {
  ErkhetConfigMoreCell,
  ErkhetConfigTitleCell,
} from '../../shared/components/ErkhetConfigColumnCells';

const formSchema = z
  .object({
    _id: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    posId: z.string().min(1, 'POS is required'),
    userEmail: z.string().min(1, 'User email is required'),
    beginNumber: z.string().optional(),
    hasVat: z.boolean().default(false),
    hasCitytax: z.boolean().default(false),
    reverseVatRules: z.string().optional(),
    reverseCtaxRules: z.string().optional(),
    defaultPay: z.string().default('debtAmount'),
  })
  .catchall(z.any());

const defaultValues: TPosOrderErkhetConfig = {
  title: '',
  posId: '',
  userEmail: '',
  beginNumber: '',
  hasVat: true,
  hasCitytax: false,
  reverseVatRules: '',
  reverseCtaxRules: '',
  defaultPay: 'debtAmount',
};

const ConfigForm = ({
  config,
  formId,
  onSubmit,
  poss,
}: {
  config?: TPosOrderErkhetConfig;
  formId: string;
  onSubmit: (data: TPosOrderErkhetConfig) => Promise<void> | void;
  poss: TPos[];
}) => {
  const { t } = useTranslation('mongolian');
  const form = useForm<TPosOrderErkhetConfig>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultValues, ...config },
  });

  const posId = form.watch('posId');
  const selectedPos = poss.find((pos) => pos._id === posId);
  const paymentTypes = selectedPos?.paymentTypes || [];

  return (
    <Form {...form}>
      <form
        id={formId}
        className="flex flex-col flex-1 overflow-hidden"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              control={form.control}
              name="title"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('title')}</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('title')} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="posId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('pos')}</Form.Label>
                  <SelectPos
                    variant="form"
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const pos = poss.find((item) => item._id === value);
                      if (pos?.name && !form.getValues('title')) {
                        form.setValue('title', pos.name);
                      }
                    }}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('user-email')}</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('enter-erkhet-user-email')} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="beginNumber"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('begin-number')}</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('prefix-for-order-number')} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="defaultPay"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('default-pay')}</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder={t('default-pay')} />
                    </Select.Trigger>
                    <Select.Content>
                      {DEFAULT_PAY_DATA.map((item) => (
                        <Select.Item key={item.value} value={item.value}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              control={form.control}
              name="hasVat"
              render={({ field }) => (
                <Form.Item className="flex items-center gap-2 space-y-0">
                  <Form.Control>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Label className="font-medium">{t('has-vat')}</Form.Label>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="hasCitytax"
              render={({ field }) => (
                <Form.Item className="flex items-center gap-2 space-y-0">
                  <Form.Control>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Label className="font-medium">{t('has-citytax')}</Form.Label>
                </Form.Item>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              control={form.control}
              name="reverseVatRules"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('reverse-vat-rule-ids')}</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('comma-separated-rule-ids')} />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="reverseCtaxRules"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('reverse-citytax-rule-ids')}</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('comma-separated-rule-ids')} />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>

          {!!paymentTypes.length && (
            <div className="grid grid-cols-2 gap-4">
              {paymentTypes.map((paymentType) => (
                <Form.Field
                  key={paymentType.type}
                  control={form.control}
                  name={`_${paymentType.type}`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        {paymentType.title || paymentType.type}
                      </Form.Label>
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={t('erkhet-payment-type')} />
                        </Select.Trigger>
                        <Select.Content>
                          {DEFAULT_PAY_DATA.map((item) => (
                            <Select.Item key={item.value} value={item.value}>
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Item>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export const PosOrderErkhetConfigAddSheet = ({
  loading,
  onSubmit,
  poss,
}: {
  loading: boolean;
  onSubmit: (data: TPosOrderErkhetConfig) => Promise<void>;
  poss: TPos[];
}) => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useState(false);
  const formId = 'pos-order-erkhet-config-add-form';
  const formKey = open ? 'open' : 'closed';

  const handleSubmit = async (data: TPosOrderErkhetConfig) => {
    await onSubmit(data);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('new-config')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>{t('new-pos-order-erkhet-config')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col overflow-hidden p-0">
          <ConfigForm
            key={formKey}
            formId={formId}
            onSubmit={handleSubmit}
            poss={poss}
          />
        </Sheet.Content>
        <Sheet.Footer>
          <Button type="submit" form={formId} disabled={loading}>
            {loading ? t('saving') : t('save')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};

const PosOrderErkhetConfigEditSheet = ({
  config,
  loading,
  onOpenChange,
  onSubmit,
  open,
  poss,
}: {
  config: TPosOrderErkhetConfig;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: TPosOrderErkhetConfig) => Promise<void>;
  open: boolean;
  poss: TPos[];
}) => {
  const { t } = useTranslation('mongolian');
  const formId = `pos-order-erkhet-config-edit-${config._id}`;

  const handleSubmit = async (data: TPosOrderErkhetConfig) => {
    await onSubmit(config._id || '', data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>{t('edit-pos-order-erkhet-config')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col overflow-hidden p-0">
          <ConfigForm
            config={config}
            formId={formId}
            onSubmit={handleSubmit}
            poss={poss}
          />
        </Sheet.Content>
        <Sheet.Footer>
          <Button type="submit" form={formId} disabled={loading}>
            {loading ? t('saving') : t('save')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};

const buildColumns = ({
  editLoading,
  onDelete,
  onEdit,
  poss,
}: {
  editLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: TPosOrderErkhetConfig) => Promise<void>;
  poss: TPos[];
}): ColumnDef<TPosOrderErkhetConfig>[] => [
  {
    id: 'more',
    cell: (cell: CellContext<TPosOrderErkhetConfig, unknown>) => (
      <ErkhetConfigMoreCell
        cell={cell as any}
        onDelete={onDelete}
        editLoading={editLoading}
        renderEditSheet={(open, onOpenChange) => (
          <PosOrderErkhetConfigEditSheet
            config={cell.row.original}
            loading={editLoading}
            onOpenChange={onOpenChange}
            onSubmit={onEdit}
            open={open}
            poss={poss}
          />
        )}
      />
    ),
    size: 25,
  },
  checkboxColumn as ColumnDef<TPosOrderErkhetConfig>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconHash} label={t('title')} />;
    },
    cell: ({ row }) => (
      <ErkhetConfigTitleCell
        config={{ _id: row.original._id ?? '', title: row.original.title }}
        renderEditSheet={(open, onOpenChange) => (
          <PosOrderErkhetConfigEditSheet
            config={row.original}
            loading={editLoading}
            onOpenChange={onOpenChange}
            onSubmit={onEdit}
            open={open}
            poss={poss}
          />
        )}
      />
    ),
    size: 220,
  },
  {
    id: 'posId',
    accessorKey: 'posId',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconBuildingStore} label={t('pos')} />;
    },
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {poss.find((pos) => pos._id === row.original.posId)?.name ||
          row.original.posId ||
          '—'}
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'userEmail',
    accessorKey: 'userEmail',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconAt} label={t('user-email')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '—'}
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'defaultPay',
    accessorKey: 'defaultPay',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconHash} label={t('default-pay')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '—'}
      </RecordTableInlineCell>
    ),
    size: 160,
  },
];

export const PosOrderErkhetConfigRecordTable = ({
  configs,
  editLoading,
  onDelete,
  onDeleteMany,
  onEdit,
  poss,
}: {
  configs: TPosOrderErkhetConfig[];
  editLoading: boolean;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onEdit: (id: string, data: TPosOrderErkhetConfig) => Promise<void>;
  poss: TPos[];
}) => {
  const { t } = useTranslation('mongolian');
  return (
    <ErkhetConfigRecordTable
      configs={configs}
      columns={buildColumns({ editLoading, onDelete, onEdit, poss })}
      emptyDescription={t('create-first-pos-order-erkhet-config')}
      commandBar={
        <ErkhetConfigCommandBar
          onDeleteMany={onDeleteMany}
          loading={editLoading}
        />
      }
    />
  );
};
