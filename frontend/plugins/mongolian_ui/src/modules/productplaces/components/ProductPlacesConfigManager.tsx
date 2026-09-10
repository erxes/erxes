import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import {
  Button,
  Checkbox,
  Combobox,
  Command,
  Input,
  Label,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  Spinner,
  TextOverflowTooltip,
  toast,
  useConfirm,
} from 'erxes-ui';
import { SelectCategory, SelectMember, SelectSegment } from 'ui-modules';
import { useTranslation } from 'react-i18next';

import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_REMOVE,
  MN_CONFIGS_UPDATE,
} from '../graphql/clientMutations';
import { MN_CONFIGS } from '../graphql/clientQueries';
import { ConfigValueItem, Condition, PlaceConditionUI } from '../types';
import {
  keyValueArrayToObject,
  objectToKeyValueArray,
} from '../utils/transformers';
import { SelectPipeline } from '../selects/SelectPipeline';
import SelectProducts from '../selects/SelectProducts';
import SelectProductTags from '../selects/SelectProductTags';
import { SelectSalesBoard } from '../selects/SelectSalesBoard';
import { SelectStage } from '../selects/SelectStage';
import PerConditions from './PerConditions';
import PerPrintConditions from './PerPrintConditions';

type ProductPlacesConfigCode =
  | 'dealsProductsDataPlaces'
  | 'dealsProductsDataSplit'
  | 'dealsProductsDataPrint'
  | 'dealsProductsDefaultFilter';

type RawConfig = {
  _id: string;
  code: ProductPlacesConfigCode;
  subId?: string;
  value?: unknown;
};

type DefaultFilterItem = {
  id: string;
  title: string;
  segmentIds: string[];
  userId: string;
};

type ProductPlacesConfigForm = {
  _id?: string;
  subId?: string;
  userId: string;
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  checkPricing: boolean;
  productCategoryIds: string[];
  excludeCategoryIds: string[];
  productTagIds: string[];
  excludeTagIds: string[];
  excludeProductIds: string[];
  segmentIds: string[];
  conditions: Array<PlaceConditionUI & Condition>;
  filters: DefaultFilterItem[];
};

type ProductPlacesConfigRow = ProductPlacesConfigForm & {
  _id: string;
  code: ProductPlacesConfigCode;
};

const PRODUCT_SEGMENT_CONTENT_TYPE = 'core:products.products';
const noopValueChange = () => undefined;

const defaultForm = (): ProductPlacesConfigForm => ({
  userId: '',
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  checkPricing: false,
  productCategoryIds: [],
  excludeCategoryIds: [],
  productTagIds: [],
  excludeTagIds: [],
  excludeProductIds: [],
  segmentIds: [],
  conditions: [],
  filters: [],
});

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const normalizeValue = (value: unknown): Record<string, unknown> => {
  if (Array.isArray(value)) {
    const keyValueItems = value.filter(
      (item): item is ConfigValueItem =>
        !!item &&
        typeof item === 'object' &&
        'key' in item &&
        typeof item.key === 'string',
    );

    if (keyValueItems.length === value.length) {
      return keyValueArrayToObject<Record<string, unknown>>(keyValueItems);
    }
  }

  return asRecord(value);
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];

const normalizeFilters = (value: unknown): DefaultFilterItem[] => {
  const filters = Array.isArray(value) ? value : [];

  return filters.map((filter, index) => {
    const record = asRecord(filter);
    const legacySegmentId =
      typeof record.segmentId === 'string' ? record.segmentId : '';

    return {
      id: typeof record.id === 'string' ? record.id : nanoid(),
      title:
        typeof record.title === 'string' && record.title
          ? record.title
          : `Filter ${index + 1}`,
      segmentIds: toStringArray(record.segmentIds).length
        ? toStringArray(record.segmentIds)
        : legacySegmentId
          ? [legacySegmentId]
          : [],
      userId:
        typeof record.userId === 'string'
          ? record.userId
          : toStringArray(record.userIds)[0] || '',
    };
  });
};

const normalizeConfig = (config: RawConfig): ProductPlacesConfigRow => {
  const value = normalizeValue(config.value);
  const legacyFilters = normalizeFilters(config.value);
  const firstLegacyFilter = legacyFilters[0];
  const conditions = Array.isArray(value.conditions)
    ? value.conditions.map((condition) => {
        const record = asRecord(condition);

        return {
          ...record,
          id: typeof record.id === 'string' ? record.id : nanoid(),
        } as PlaceConditionUI & Condition;
      })
    : [];

  return {
    ...defaultForm(),
    _id: config._id,
    code: config.code,
    subId: config.subId,
    userId:
      typeof value.userId === 'string'
        ? value.userId
        : config.subId || firstLegacyFilter?.userId || '',
    title:
      typeof value.title === 'string'
        ? value.title
        : firstLegacyFilter?.title || '',
    boardId: typeof value.boardId === 'string' ? value.boardId : '',
    pipelineId: typeof value.pipelineId === 'string' ? value.pipelineId : '',
    stageId:
      typeof value.stageId === 'string' ? value.stageId : config.subId || '',
    checkPricing: value.checkPricing === true,
    productCategoryIds: toStringArray(value.productCategoryIds),
    excludeCategoryIds: toStringArray(value.excludeCategoryIds),
    productTagIds: toStringArray(value.productTagIds),
    excludeTagIds: toStringArray(value.excludeTagIds),
    excludeProductIds: toStringArray(value.excludeProductIds),
    segmentIds: toStringArray(value.segmentIds).length
      ? toStringArray(value.segmentIds)
      : firstLegacyFilter?.segmentIds || [],
    conditions,
    filters: legacyFilters,
  };
};

const serializeConfigValue = (
  code: ProductPlacesConfigCode,
  form: ProductPlacesConfigForm,
) => {
  if (code === 'dealsProductsDefaultFilter') {
    return {
      title: form.title,
      userId: form.userId,
      segmentIds: form.segmentIds,
    };
  }

  return objectToKeyValueArray({
    title: form.title,
    boardId: form.boardId,
    pipelineId: form.pipelineId,
    stageId: form.stageId,
    checkPricing: form.checkPricing,
    productCategoryIds: form.productCategoryIds,
    excludeCategoryIds: form.excludeCategoryIds,
    productTagIds: form.productTagIds,
    excludeTagIds: form.excludeTagIds,
    excludeProductIds: form.excludeProductIds,
    segmentIds: form.segmentIds,
    conditions: form.conditions,
  });
};

const configTitle = (
  code: ProductPlacesConfigCode,
  t: ReturnType<typeof useTranslation>['t'],
) => {
  const titles: Record<ProductPlacesConfigCode, string> = {
    dealsProductsDataPlaces: t('product-places-config'),
    dealsProductsDataSplit: t('split-configuration'),
    dealsProductsDataPrint: t('print-configuration'),
    dealsProductsDefaultFilter: t('default-filter-configuration'),
  };

  return titles[code];
};

const ProductPlacesConfigMoreCell = ({
  cell,
  onEdit,
  onDelete,
}: {
  cell: Cell<ProductPlacesConfigRow, unknown>;
  onEdit: (row: ProductPlacesConfigRow) => void;
  onDelete: (row: ProductPlacesConfigRow) => void;
}) => {
  const { t } = useTranslation('mongolian');
  const row = cell.row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => onEdit(row)}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={() => onDelete(row)}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const FormShell = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-6">{children}</div>
);

const StageFields = ({
  form,
  setForm,
}: {
  form: ProductPlacesConfigForm;
  setForm: React.Dispatch<React.SetStateAction<ProductPlacesConfigForm>>;
}) => {
  const { t } = useTranslation('mongolian');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>{t('board')}</Label>
        <SelectSalesBoard
          variant="form"
          value={form.boardId}
          onValueChange={(boardId) =>
            setForm((prev) => ({
              ...prev,
              boardId,
              pipelineId: '',
              stageId: '',
            }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label>{t('pipeline')}</Label>
        <SelectPipeline
          variant="form"
          boardId={form.boardId}
          value={form.pipelineId}
          onValueChange={(pipelineId) =>
            setForm((prev) => ({ ...prev, pipelineId, stageId: '' }))
          }
          disabled={!form.boardId}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('stage')}</Label>
        <SelectStage
          id="product-places-config-stage"
          variant="form"
          pipelineId={form.pipelineId}
          value={form.stageId}
          onValueChange={(stageId) => setForm((prev) => ({ ...prev, stageId }))}
          disabled={!form.pipelineId}
        />
      </div>
    </div>
  );
};

const ProductPlacesConfigEditor = ({
  code,
  form,
  setForm,
}: {
  code: ProductPlacesConfigCode;
  form: ProductPlacesConfigForm;
  setForm: React.Dispatch<React.SetStateAction<ProductPlacesConfigForm>>;
}) => {
  const { t } = useTranslation('mongolian');

  const addPlaceCondition = () =>
    setForm((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { id: nanoid() }],
    }));

  const updateCondition = (
    id: string,
    condition: PlaceConditionUI & Condition,
  ) =>
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.map((item) =>
        item.id === id ? condition : item,
      ),
    }));

  const removeCondition = (id: string) =>
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((item) => item.id !== id),
    }));

  return (
    <FormShell>
      <div className="space-y-2">
        <Label>{t('title')}</Label>
        <Input
          value={form.title}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, title: event.target.value }))
          }
          placeholder={t('enter-configuration-title')}
        />
      </div>

      {code !== 'dealsProductsDefaultFilter' && (
        <>
          <StageFields form={form} setForm={setForm} />

          {code === 'dealsProductsDataPlaces' && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.checkPricing}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    checkPricing: checked === true,
                  }))
                }
              />
              {t('check-pricing')}
            </label>
          )}
        </>
      )}

      {code === 'dealsProductsDataSplit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('include-categories')}</Label>
            <SelectCategory
              mode="multiple"
              value={form.productCategoryIds}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  productCategoryIds: Array.isArray(value) ? value : [value],
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('exclude-categories')}</Label>
            <SelectCategory
              mode="multiple"
              value={form.excludeCategoryIds}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  excludeCategoryIds: Array.isArray(value) ? value : [value],
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('include-tags')}</Label>
            <SelectProductTags
              value={form.productTagIds}
              onValueChange={(productTagIds) =>
                setForm((prev) => ({ ...prev, productTagIds }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('exclude-tags')}</Label>
            <SelectProductTags
              value={form.excludeTagIds}
              onValueChange={(excludeTagIds) =>
                setForm((prev) => ({ ...prev, excludeTagIds }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('exclude-products')}</Label>
            <SelectProducts
              value={form.excludeProductIds}
              onValueChange={(excludeProductIds: string[]) =>
                setForm((prev) => ({ ...prev, excludeProductIds }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('segment')}</Label>
            <SelectSegment
              mode="multiple"
              contentType={PRODUCT_SEGMENT_CONTENT_TYPE}
              selected={form.segmentIds}
              onSelect={(segmentIds) =>
                setForm((prev) => ({
                  ...prev,
                  segmentIds: Array.isArray(segmentIds) ? segmentIds : [],
                }))
              }
            />
          </div>
        </div>
      )}

      {code === 'dealsProductsDataPlaces' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {t('conditions', { count: form.conditions.length })}
            </h3>
            <Button type="button" variant="outline" onClick={addPlaceCondition}>
              <IconPlus /> {t('add-condition')}
            </Button>
          </div>
          {form.conditions.map((condition, index) => (
            <PerConditions
              key={condition.id}
              condition={condition}
              onChange={updateCondition}
              onRemove={removeCondition}
              onAddCondition={
                index === form.conditions.length - 1
                  ? addPlaceCondition
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {code === 'dealsProductsDataPrint' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {t('conditions', { count: form.conditions.length })}
            </h3>
            <Button type="button" variant="outline" onClick={addPlaceCondition}>
              <IconPlus /> {t('add-condition')}
            </Button>
          </div>
          {form.conditions.map((condition, index) => (
            <PerPrintConditions
              key={condition.id}
              condition={condition}
              onChange={updateCondition}
              onRemove={removeCondition}
              onAddCondition={
                index === form.conditions.length - 1
                  ? addPlaceCondition
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {code === 'dealsProductsDefaultFilter' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('assigned-users')}</Label>
            <SelectMember
              value={form.userId}
              onValueChange={(userId) =>
                setForm((prev) => ({
                  ...prev,
                  userId: typeof userId === 'string' ? userId : '',
                  subId: typeof userId === 'string' ? userId : '',
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('segment')}</Label>
            <SelectSegment
              mode="multiple"
              contentType={PRODUCT_SEGMENT_CONTENT_TYPE}
              selected={form.segmentIds}
              onSelect={(segmentIds) =>
                setForm((prev) => ({
                  ...prev,
                  segmentIds: Array.isArray(segmentIds) ? segmentIds : [],
                }))
              }
            />
          </div>
        </div>
      )}
    </FormShell>
  );
};

export const ProductPlacesConfigManager = ({
  code,
}: {
  code: ProductPlacesConfigCode;
}) => {
  const { t } = useTranslation('mongolian');
  const { confirm } = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductPlacesConfigForm>(defaultForm());
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useQuery<{ mnConfigs: RawConfig[] }>(
    MN_CONFIGS,
    {
      variables: { code },
      fetchPolicy: 'network-only',
    },
  );

  const [createConfig] = useMutation(MN_CONFIGS_CREATE);
  const [updateConfig] = useMutation(MN_CONFIGS_UPDATE);
  const [removeConfig] = useMutation(MN_CONFIGS_REMOVE);

  const rows = useMemo(
    () => (data?.mnConfigs || []).map(normalizeConfig),
    [data?.mnConfigs],
  );

  const handleNew = () => {
    setForm(defaultForm());
    setOpen(true);
  };

  const handleEdit = (row: ProductPlacesConfigRow) => {
    setForm(row);
    setOpen(true);
  };

  const handleDelete = (row: ProductPlacesConfigRow) => {
    confirm({
      message: t('delete-this-config-confirm'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(async () => {
      await removeConfig({ variables: { _id: row._id } });
      await refetch();
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const value = serializeConfigValue(code, form);
      const subId =
        code === 'dealsProductsDefaultFilter'
          ? form.userId || form.subId || ''
          : form.stageId;

      if (form._id) {
        await updateConfig({
          variables: { _id: form._id, subId, value },
        });
      } else {
        await createConfig({
          variables: { code, subId, value },
        });
      }

      toast({ title: t('success'), description: t('configuration-saved') });
      setOpen(false);
      setForm(defaultForm());
      await refetch();
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : t('failed-to-save-configuration'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<ProductPlacesConfigRow>[]>(() => {
    const commonColumns: ColumnDef<ProductPlacesConfigRow>[] = [
      {
        id: 'more',
        header: () => <RecordTable.ColumnSelector />,
        cell: ({ cell }) => (
          <ProductPlacesConfigMoreCell
            cell={cell}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
        size: 33,
      },
      RecordTable.checkboxColumn as ColumnDef<ProductPlacesConfigRow>,
      {
        id: 'title',
        accessorKey: 'title',
        header: () => <RecordTable.InlineHead label={t('title')} />,
        cell: ({ cell }) => (
          <RecordTableInlineCell
            className="cursor-pointer"
            onClick={() => handleEdit(cell.row.original)}
          >
            <TextOverflowTooltip
              value={(cell.getValue() as string) || t('untitled-config')}
            />
          </RecordTableInlineCell>
        ),
        size: 240,
      },
    ];

    const summaryColumn: ColumnDef<ProductPlacesConfigRow> = {
      id: 'summary',
      header: () => <RecordTable.InlineHead label={t('description')} />,
      cell: ({ row }) => {
        const original = row.original;
        const summary =
          code === 'dealsProductsDefaultFilter'
            ? `${original.segmentIds.length} ${t('segment')}`
            : t('conditions', { count: original.conditions.length });

        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={summary} />
          </RecordTableInlineCell>
        );
      },
      size: 180,
    };

    if (code === 'dealsProductsDefaultFilter') {
      return [
        ...commonColumns,
        {
          id: 'userId',
          accessorKey: 'userId',
          header: () => <RecordTable.InlineHead label={t('user')} />,
          cell: ({ cell }) => {
            const value = (cell.getValue() as string) || '';

            return (
              <RecordTableInlineCell>
                <SelectMember.Provider value={value}>
                  <SelectMember.Value placeholder="-" />
                </SelectMember.Provider>
              </RecordTableInlineCell>
            );
          },
          size: 240,
        },
        summaryColumn,
      ];
    }

    return [
      ...commonColumns,
      {
        id: 'boardId',
        accessorKey: 'boardId',
        header: () => <RecordTable.InlineHead label={t('board')} />,
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <SelectSalesBoard.Provider
              value={row.original.boardId}
              onValueChange={noopValueChange}
            >
              <SelectSalesBoard.Value placeholder="-" />
            </SelectSalesBoard.Provider>
          </RecordTableInlineCell>
        ),
        size: 180,
      },
      {
        id: 'pipelineId',
        accessorKey: 'pipelineId',
        header: () => <RecordTable.InlineHead label={t('pipeline')} />,
        cell: ({ row }) => {
          return (
            <RecordTableInlineCell>
              <SelectPipeline.Provider
                boardId={row.original.boardId}
                value={row.original.pipelineId}
                onValueChange={noopValueChange}
              >
                <SelectPipeline.Value placeholder="-" />
              </SelectPipeline.Provider>
            </RecordTableInlineCell>
          );
        },
        size: 180,
      },
      {
        id: 'stageId',
        accessorKey: 'stageId',
        header: () => <RecordTable.InlineHead label={t('stage')} />,
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <SelectStage.Provider
              pipelineId={row.original.pipelineId}
              value={row.original.stageId}
              onValueChange={noopValueChange}
            >
              <SelectStage.Value placeholder="-" />
            </SelectStage.Provider>
          </RecordTableInlineCell>
        ),
        size: 180,
      },
      summaryColumn,
    ];
  }, [code, t]);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{configTitle(code, t)}</h2>
        <Button onClick={handleNew}>
          <IconPlus /> {t('add-config')}
        </Button>
      </div>

      <RecordTable.Provider
        columns={columns}
        data={rows}
        stickyColumns={['more', 'checkbox']}
        tableId={`mongolian_product_places_${code}_record_table_v2`}
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {loading && <RecordTable.RowSkeleton rows={4} />}
            </RecordTable.Body>
          </RecordTable>
          {!loading && rows.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('no-configurations')}
                </p>
                <Button onClick={handleNew}>
                  <IconPlus /> {t('add-config')}
                </Button>
              </div>
            </div>
          )}
        </RecordTable.Scroll>
      </RecordTable.Provider>

      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.View side="right" className="bg-background sm:max-w-4xl">
          <Sheet.Header>
            <Sheet.Title>{configTitle(code, t)}</Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ProductPlacesConfigEditor
              code={code}
              form={form}
              setForm={setForm}
            />
          </div>
          <Sheet.Footer className="gap-2 border-t bg-background">
            <Sheet.Close asChild>
              <Button variant="outline" size="lg">
                {t('cancel')}
              </Button>
            </Sheet.Close>
            <Button size="lg" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner /> : t('save')}
            </Button>
          </Sheet.Footer>
        </Sheet.View>
      </Sheet>
    </div>
  );
};
