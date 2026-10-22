import { useMemo, useState } from 'react';
import {
  IconApps,
  IconArrowDown,
  IconArrowUp,
  IconChevronRight,
  IconFilter,
  IconPlus,
  IconRestore,
  IconSearch,
} from '@tabler/icons-react';
import { Button, Input, Popover, Select, Table } from 'erxes-ui';
import { Can } from 'ui-modules';
import type { useDataModelFields } from '../hooks';
import { uniqueModelFields } from '../relationGroups';
import type { DataModel, ModelField } from '../types';
import { DataModelError, DataModelLoading } from './DataModelFeedback';
import { DataModelFieldIcon, dataModelFieldLabel } from './DataModelVisuals';
import { DataModelTargetLink } from './DataModelTargetLink';

export interface DataModelDisplayField {
  id: string;
  name: string;
  label: string;
  type: string;
  custom?: ModelField;
}

export const dataModelDisplayFieldType = (
  field: DataModelDisplayField,
): string => {
  if (field.custom?.relation) {
    return field.custom.relation.multiple ? 'Has many' : 'Belongs to';
  }
  return dataModelFieldLabel(field.type);
};

interface SectionProps {
  model: DataModel;
  kind: 'fields' | 'relations';
  result: ReturnType<typeof useDataModelFields>;
  archived: boolean;
  onArchivedChange: (archived: boolean) => void;
  onCreate: () => void;
  onEdit: (field: ModelField) => void;
  onInspect: (field: DataModelDisplayField) => void;
  onRestore: (field: ModelField) => void;
}

export const DataModelFieldSection = ({
  model,
  kind,
  result: { fields, loading, error, refreshError, retry },
  archived,
  onArchivedChange,
  onCreate,
  onEdit,
  onInspect,
  onRestore,
}: SectionProps) => {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('all');
  const [ascending, setAscending] = useState(true);
  const relations = kind === 'relations';
  const title = relations ? 'Relations' : 'Fields';
  const singular = relations ? 'relation' : 'field';
  const rows = useMemo(() => {
    const definitions: DataModelDisplayField[] = [
      ...(!archived && !relations
        ? model.systemFields.map((field) => ({
            id: `system:${field.code}`,
            name: field.code,
            label: field.name,
            type:
              field.type === 'relation' &&
              ['createdBy', 'updatedBy', 'deletedBy'].includes(field.code)
                ? 'actor'
                : field.type,
          }))
        : []),
      ...uniqueModelFields(fields)
        .filter((field) => Boolean(field.relation) === relations)
        .map((field) => ({
          id: field._id,
          name: field.relation?.morphName ?? field.name,
          label: field.label,
          type: field.type,
          custom: field,
        })),
    ];
    const needle = search.trim().toLowerCase();
    return definitions
      .filter(
        (field) =>
          (!needle ||
            `${field.label} ${field.name}`.toLowerCase().includes(needle)) &&
          (source === 'all' ||
            (source === 'custom' ? Boolean(field.custom) : !field.custom)),
      )
      .sort((a, b) => (ascending ? 1 : -1) * a.label.localeCompare(b.label));
  }, [
    model.systemFields,
    archived,
    relations,
    fields,
    search,
    source,
    ascending,
  ]);

  return (
    <section
      aria-label={title}
      className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8"
    >
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {relations
            ? 'Connect actual records without copying their information. A linked name opens its record.'
            : `Choose what your team fills in for each ${model.labelSingular.toLowerCase()}. Built-in fields stay protected.`}
        </p>
      </div>
      <div className="min-w-0 space-y-1">
        {refreshError && (
          <DataModelError error={refreshError} onRetry={retry} />
        )}
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label={`Search ${kind}`}
              placeholder={`Search a ${singular}…`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 border-transparent bg-muted/50 pl-8 shadow-none"
            />
          </div>
          <Popover>
            <Popover.Trigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Filter ${kind}`}
                className={`size-8 border border-border/60 bg-muted/30 shadow-none ${
                  archived || source !== 'all'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <IconFilter className="size-3.5" />
              </Button>
            </Popover.Trigger>
            <Popover.Content align="end" className="w-60 space-y-4 p-4">
              <div className="space-y-2">
                <p className="text-xs font-medium">Status</p>
                <Select
                  value={archived ? 'archived' : 'active'}
                  onValueChange={(value) =>
                    onArchivedChange(value === 'archived')
                  }
                >
                  <Select.Trigger
                    aria-label={`${relations ? 'Relation' : 'Field'} status`}
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="active">Active {kind}</Select.Item>
                    <Select.Item value="archived">Archived {kind}</Select.Item>
                  </Select.Content>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium">App</p>
                <Select value={source} onValueChange={setSource}>
                  <Select.Trigger
                    aria-label={`${relations ? 'Relation' : 'Field'} source`}
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All {kind}</Select.Item>
                    <Select.Item value="system">Built-in {kind}</Select.Item>
                    <Select.Item value="custom">Custom {kind}</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </Popover.Content>
          </Popover>
        </div>
        {error ? (
          <DataModelError error={error} onRetry={retry} />
        ) : loading ? (
          <DataModelLoading />
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[32rem] bg-transparent [&_th]:h-9 [&_th]:border-b [&_th]:border-border/50 [&_th]:bg-transparent [&_th]:font-sans [&_th]:font-normal [&_th]:normal-case [&_th]:text-muted-foreground [&_td]:h-9 [&_td]:border-x-0 [&_td]:border-b-0 [&_td]:bg-transparent [&_td]:px-2 [&_tr:last-child>td]:border-b [&_tr:last-child>td]:border-border/50 [&_tr>td:first-child]:border-l-0">
              <Table.Header>
                <Table.Row>
                  <Table.Head
                    className="w-[52%]"
                    aria-sort={ascending ? 'ascending' : 'descending'}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-8 gap-1 px-2 font-normal text-muted-foreground"
                      aria-label={`Sort ${kind} by name`}
                      onClick={() => setAscending(!ascending)}
                    >
                      Name
                      {ascending ? (
                        <IconArrowUp className="size-3" />
                      ) : (
                        <IconArrowDown className="size-3" />
                      )}
                    </Button>
                  </Table.Head>
                  <Table.Head className="w-[21%]">
                    {relations ? 'Related object' : 'Source'}
                  </Table.Head>
                  <Table.Head>{relations ? 'Type' : 'Data type'}</Table.Head>
                  <Table.Head className="w-9">
                    <span className="sr-only">Actions</span>
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((field) => (
                  <Table.Row
                    key={field.id}
                    className="[&>td]:border-b-0 last:[&>td]:border-b last:[&>td]:border-border/50"
                  >
                    <Table.Cell>
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-muted-foreground">
                          <DataModelFieldIcon type={field.type} />
                        </span>
                        <DataModelFieldOpenButton
                          field={field}
                          archived={archived}
                          onEdit={onEdit}
                          onInspect={onInspect}
                        />
                        {field.custom?.required && (
                          <span
                            className="text-xs text-muted-foreground"
                            title="Required"
                          >
                            *
                          </span>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {relations && field.custom?.relation ? (
                        <span className="text-xs text-muted-foreground">
                          {field.custom.relation.morphId ? (
                            'Multiple objects'
                          ) : (
                            <DataModelTargetLink
                              modelId={field.custom.relation.targetModelId}
                            />
                          )}
                          {field.custom.relation.isInverse && (
                            <span className="mt-1 block text-[10px]">
                              Automatic reverse link
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <IconApps
                            className={`size-3.5 ${
                              field.custom ? 'text-orange-500' : 'text-primary'
                            }`}
                          />
                          {field.custom ? 'Custom' : 'Built-in'}
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="rounded-xs bg-primary/5 text-primary/80">
                          <DataModelFieldIcon type={field.type} />
                        </span>
                        {dataModelDisplayFieldType(field)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {archived &&
                      field.custom &&
                      !field.custom.relation?.isInverse ? (
                        <Can
                          action="dataModelsManage"
                          fallback={
                            <DataModelFieldOpenButton
                              field={field}
                              archived={archived}
                              onEdit={onEdit}
                              onInspect={onInspect}
                              icon
                            />
                          }
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            aria-label={`Restore ${field.label}`}
                            onClick={() =>
                              field.custom && onRestore(field.custom)
                            }
                          >
                            <IconRestore className="size-3.5 text-muted-foreground" />
                          </Button>
                        </Can>
                      ) : (
                        <DataModelFieldOpenButton
                          field={field}
                          archived={archived}
                          onEdit={onEdit}
                          onInspect={onInspect}
                          icon
                        />
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
                {!rows.length && (
                  <Table.Row>
                    <Table.Cell colSpan={4}>
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        {search || source !== 'all'
                          ? `No ${kind} match your filters.`
                          : archived
                          ? `No archived ${kind}.`
                          : `No ${kind} yet. Add the first ${singular} to this object.`}
                      </p>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        )}
        {!archived && (
          <Can action="dataModelsManage">
            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 border border-border/60 bg-muted/30 px-2 font-normal text-muted-foreground shadow-none"
                onClick={onCreate}
              >
                <IconPlus className="size-3.5" />
                Add {singular}
              </Button>
            </div>
          </Can>
        )}
      </div>
    </section>
  );
};

const DataModelFieldOpenButton = ({
  field,
  archived,
  onEdit,
  onInspect,
  icon = false,
}: Pick<SectionProps, 'archived' | 'onEdit' | 'onInspect'> & {
  field: DataModelDisplayField;
  icon?: boolean;
}) => {
  const props = {
    variant: 'ghost' as const,
    className: icon
      ? 'size-7 text-muted-foreground'
      : 'h-8 min-w-0 justify-start truncate p-0 font-normal text-foreground hover:bg-transparent hover:underline',
    children: icon ? <IconChevronRight className="size-3.5" /> : field.label,
  };
  const inspect = (
    <Button
      {...props}
      aria-label={icon ? `View ${field.label}` : undefined}
      onClick={() => onInspect(field)}
    />
  );
  const custom = field.custom;
  if (!custom)
    return icon ? (
      <Button
        {...props}
        disabled
        aria-label={`${field.label} is managed by erxes`}
        title="Managed by erxes"
      />
    ) : (
      <span className="truncate text-sm">{field.label}</span>
    );
  if (custom.relation?.isInverse || archived) return inspect;
  return (
    <Can action="dataModelsManage" fallback={inspect}>
      <Button
        {...props}
        aria-label={icon ? `Edit ${field.label}` : undefined}
        onClick={() => onEdit(custom)}
      />
    </Can>
  );
};
