import {
  IconCalendar,
  IconDeviceFloppy,
  IconLayoutKanban,
  IconPlus,
  IconSearch,
  IconTable,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Input,
  Label,
  Popover,
  Select,
  toast,
  ToggleGroup,
  useConfirm,
} from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionViewType,
  IDataExtensionFilter,
  IDataExtensionRecordType,
  IDataExtensionView,
  isBoardField,
  isDateField,
  useDataExtensionFields,
} from 'ui-modules';
import { useDataExtensionPermissions } from '../hooks/useDataExtensionPermissions';
import { useDataExtensionViews } from '../hooks/useDataExtensionViews';
import { DataExtensionCalendar } from './DataExtensionCalendar';
import { DataExtensionCsvActions } from './DataExtensionCsvActions';
import { DataExtensionCustomRecordSheet } from './DataExtensionCustomRecordSheet';
import { DataExtensionFilterBuilder, readyConditions } from './DataExtensionFilterBuilder';
import { DataExtensionKanban } from './DataExtensionKanban';
import { DataExtensionRecordsTable, RecordsSort } from './DataExtensionRecordsTable';

const ALL_RECORDS = '__all__';
const EMPTY_FILTER: IDataExtensionFilter = { match: 'all', conditions: [] };
const DEFAULT_SORT: RecordsSort = { field: 'createdAt', direction: -1 };

interface IViewState {
  type: DataExtensionViewType;
  filter: IDataExtensionFilter;
  sort: RecordsSort;
  groupBy?: string;
  dateField?: string;
  columns?: string[] | null;
}

const stateOf = (view?: IDataExtensionView): IViewState => ({
  type: view?.type || 'table',
  filter: (view?.filter as IDataExtensionFilter) || EMPTY_FILTER,
  sort: view?.sortField
    ? { field: view.sortField, direction: view.sortDirection === 1 ? 1 : -1 }
    : DEFAULT_SORT,
  groupBy: view?.groupBy || undefined,
  dateField: view?.dateField || undefined,
  columns: view?.columns,
});

const toInput = (state: IViewState) => ({
  type: state.type,
  filter: readyConditions(state.filter),
  sortField: state.sort.field,
  sortDirection: state.sort.direction,
  groupBy: state.groupBy || '',
  dateField: state.dateField || '',
  columns: state.columns || [],
});

const useDebounced = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

/** Name and sharing for a new view, in a small popover. */
const SaveViewPopover = ({
  canShare,
  saving,
  onSave,
}: {
  canShare: boolean;
  saving: boolean;
  onSave: (name: string, shared: boolean) => Promise<void>;
}) => {
  const { t } = useTranslation('dataExtensions');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [shared, setShared] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconDeviceFloppy />
          {t('views.save-as')}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-72 p-3">
        <form
          className="flex flex-col gap-3"
          onSubmit={async (event) => {
            event.preventDefault();

            if (!name.trim()) {
              return;
            }

            await onSave(name.trim(), shared);
            setName('');
            setShared(false);
            setOpen(false);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data-extensions-view-name">{t('views.name')}</Label>
            <Input
              id="data-extensions-view-name"
              autoFocus
              maxLength={80}
              value={name}
              placeholder={t('views.name-placeholder')}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {canShare && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="data-extensions-view-shared"
                checked={shared}
                onCheckedChange={(checked) => setShared(Boolean(checked))}
              />
              <Label htmlFor="data-extensions-view-shared" className="font-normal">
                {t('views.share')}
              </Label>
            </div>
          )}
          <Button type="submit" disabled={!name.trim() || saving}>
            {t('views.save')}
          </Button>
        </form>
      </Popover.Content>
    </Popover>
  );
};

/**
 * A custom object's records as a table, board or calendar, with filters,
 * search and saved views, and a sheet to open or add a record.
 */
export const DataExtensionRecordsView = ({
  recordType,
}: {
  recordType: IDataExtensionRecordType;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { confirm } = useConfirm();
  const { canManage, canManageRecords } = useDataExtensionPermissions();
  const { fields } = useDataExtensionFields({ recordType: recordType.recordType });
  const { views, saving, addView, editView, deleteView } = useDataExtensionViews(
    recordType.recordType,
  );
  const [viewId, setViewId] = useState(ALL_RECORDS);
  const [state, setState] = useState<IViewState>(stateOf());
  const [search, setSearch] = useState('');
  const searchValue = useDebounced(search.trim()) || undefined;
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [version, setVersion] = useState(0);
  const view = views.find((candidate) => candidate._id === viewId);
  const boardFields = useMemo(() => fields.filter(isBoardField), [fields]);
  const dateFields = useMemo(() => fields.filter(isDateField), [fields]);
  const filter = useMemo(() => readyConditions(state.filter), [state.filter]);
  const groupField =
    boardFields.find((field) => field.key === state.groupBy) || boardFields[0];
  const dateField =
    dateFields.find((field) => field.key === state.dateField) || dateFields[0];
  const singular = recordType.singularLabel || recordType.label;
  const dirty =
    Boolean(view) &&
    JSON.stringify(toInput(state)) !== JSON.stringify(toInput(stateOf(view)));
  const canEditView = view ? (view.shared ? canManage : true) : false;

  useEffect(() => {
    setViewId(ALL_RECORDS);
    setState(stateOf());
    setSearch('');
  }, [recordType.recordType]);

  const selectView = (id: string) => {
    setViewId(id);
    setState(stateOf(views.find((candidate) => candidate._id === id)));
  };

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast({ variant: 'success', title: success });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('views.save-failed'),
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const typeOptions: {
    value: DataExtensionViewType;
    icon: typeof IconTable;
    disabled?: boolean;
  }[] = [
    { value: 'table', icon: IconTable },
    { value: 'kanban', icon: IconLayoutKanban, disabled: !boardFields.length },
    { value: 'calendar', icon: IconCalendar, disabled: !dateFields.length },
  ];

  const renderBody = () => {
    const shared = { recordType, fields, filter, searchValue, onOpen: setOpenId, version };

    if (state.type === 'kanban' && groupField) {
      return <DataExtensionKanban {...shared} groupField={groupField} />;
    }

    if (state.type === 'calendar' && dateField) {
      return <DataExtensionCalendar {...shared} dateField={dateField} />;
    }

    return (
      <DataExtensionRecordsTable
        {...shared}
        columnKeys={state.columns}
        sort={state.sort}
        onSortChange={(sort) => setState((current) => ({ ...current, sort }))}
        onCreate={canManageRecords ? () => setCreating(true) : undefined}
      />
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
        <Select value={viewId} onValueChange={selectView}>
          <Select.Trigger className="w-48" aria-label={t('views.title')}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL_RECORDS}>
              {t('views.all', { label: recordType.label })}
            </Select.Item>
            {views.map((candidate) => (
              <Select.Item key={candidate._id} value={candidate._id}>
                {candidate.name}
                {candidate.shared ? ` · ${t('views.shared')}` : ''}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <ToggleGroup
          type="single"
          value={state.type}
          onValueChange={(type) =>
            type && setState((current) => ({ ...current, type: type as DataExtensionViewType }))
          }
          aria-label={t('views.layout')}
        >
          {typeOptions.map(({ value, icon: Icon, disabled }) => (
            <ToggleGroup.Item
              key={value}
              value={value}
              disabled={disabled}
              aria-label={t(`views.types.${value}`)}
              title={disabled ? t(`views.needs.${value}`) : t(`views.types.${value}`)}
            >
              <Icon />
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
        {state.type === 'kanban' && boardFields.length > 1 && (
          <Select
            value={groupField?.key}
            onValueChange={(groupBy) => setState((current) => ({ ...current, groupBy }))}
          >
            <Select.Trigger className="w-40" aria-label={t('views.group-by')}>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {boardFields.map((field) => (
                <Select.Item key={field.key} value={field.key}>
                  {field.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
        {state.type === 'calendar' && dateFields.length > 1 && (
          <Select
            value={dateField?.key}
            onValueChange={(key) => setState((current) => ({ ...current, dateField: key }))}
          >
            <Select.Trigger className="w-40" aria-label={t('views.date-field')}>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {dateFields.map((field) => (
                <Select.Item key={field.key} value={field.key}>
                  {field.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
        <DataExtensionFilterBuilder
          recordType={recordType}
          fields={fields}
          filter={state.filter}
          onChange={(next) => setState((current) => ({ ...current, filter: next }))}
        />
        <div className="relative w-full max-w-56">
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('records.search', { label: recordType.label })}
            aria-label={t('records.search', { label: recordType.label })}
            className="pl-8"
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <DataExtensionCsvActions
            recordType={recordType}
            fields={fields}
            filter={filter}
            canImport={canManageRecords}
            onImported={() => setVersion((current) => current + 1)}
          />
          {view && dirty && canEditView && (
            <Button
              variant="ghost"
              disabled={saving}
              onClick={() =>
                run(
                  () => editView(view._id, toInput(state)),
                  t('views.updated', { name: view.name }),
                )
              }
            >
              <IconDeviceFloppy />
              {t('views.update')}
            </Button>
          )}
          <SaveViewPopover
            canShare={canManage}
            saving={saving}
            onSave={(name, isShared) =>
              run(async () => {
                const created = await addView({ ...toInput(state), name, shared: isShared });

                setViewId(created._id);
              }, t('views.created', { name }))
            }
          />
          {view && canEditView && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('views.delete', { name: view.name })}
              title={t('views.delete', { name: view.name })}
              onClick={() =>
                confirm({
                  message: t('views.delete-confirm', { name: view.name }),
                  options: { okLabel: t('delete'), variants: { ok: 'destructive' } },
                }).then(() =>
                  run(async () => {
                    await deleteView(view._id);
                    selectView(ALL_RECORDS);
                  }, t('views.deleted', { name: view.name })),
                )
              }
            >
              <IconTrash />
            </Button>
          )}
          {canManageRecords && (
            <Button onClick={() => setCreating(true)}>
              <IconPlus />
              {t('records.new', { label: singular })}
            </Button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-auto">{renderBody()}</div>
      <DataExtensionCustomRecordSheet
        recordType={recordType}
        recordId={openId}
        creating={creating}
        onClose={() => {
          // Values edited in place show in the view once the sheet closes.
          if (openId) {
            setVersion((current) => current + 1);
          }

          setOpenId(null);
          setCreating(false);
        }}
        onChanged={() => setVersion((current) => current + 1)}
        onCreated={(id) => {
          setCreating(false);
          setOpenId(id);
        }}
      />
    </div>
  );
};
