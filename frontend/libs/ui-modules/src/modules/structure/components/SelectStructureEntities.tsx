import { IconHierarchy, IconPlus } from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  SelectTree,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Can } from '../../permissions/components/PermissionGate';
import { SelectStructureEntitiesContext } from '../contexts/SelectStructureEntitiesContext';
import { useSelectStructureEntitiesContext } from '../hooks/useSelectStructureEntitiesContext';
import { useStructureEntities } from '../hooks/useStructureEntities';
import {
  ISelectStructureEntitiesProviderProps,
  IStructureEntitiesFilter,
  IStructureEntity,
  IStructureEntityTreeNode,
} from '../types/StructureEntity';
import { getStructureEntityTree } from '../utils/structureEntityTree';
import { StructureEntitiesInline } from './StructureEntitiesInline';
import { StructureEntityBadge } from './StructureEntityBadge';

const STRUCTURE_SETTINGS_PATH = '/settings/structures';

type TSelectStructureEntitiesProps = Omit<
  ISelectStructureEntitiesProviderProps,
  'children'
>;

const toEntityIds = (value?: string[] | string) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export const SelectStructureEntitiesProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
  typeIds,
  capability,
  excludeIds,
  descendantOf,
  includeArchived,
}: ISelectStructureEntitiesProviderProps) => {
  const [selectedEntities, setSelectedEntities] = useState<IStructureEntity[]>(
    [],
  );
  const entityIds = toEntityIds(value);

  const onRemove = (entityId: string) => {
    setSelectedEntities((entities) =>
      entities.filter(({ _id }) => _id !== entityId),
    );
    onValueChange?.(
      mode === 'single' ? undefined : entityIds.filter((id) => id !== entityId),
    );
  };

  const onSelect = (entity: IStructureEntity) => {
    if (entityIds.includes(entity._id)) {
      onRemove(entity._id);
      return;
    }

    setSelectedEntities((entities) =>
      mode === 'single'
        ? [entity]
        : [...entities.filter(({ _id }) => _id !== entity._id), entity],
    );
    onValueChange?.(
      mode === 'single' ? entity._id : [...entityIds, entity._id],
    );
  };

  return (
    <SelectStructureEntitiesContext.Provider
      value={{
        entityIds,
        selectedEntities,
        mode,
        onSelect,
        onRemove,
        typeIds,
        capability,
        excludeIds,
        descendantOf,
        includeArchived,
      }}
    >
      {children}
    </SelectStructureEntitiesContext.Provider>
  );
};

const SelectStructureEntitiesManage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'structure-entities' });

  return (
    <Can action="structureEntitiesManage">
      <div className="flex justify-center p-2">
        <Button variant="secondary" size="sm" asChild>
          <Link to={STRUCTURE_SETTINGS_PATH}>
            <IconHierarchy />
            {t('manage')}
          </Link>
        </Button>
      </div>
    </Can>
  );
};

export const SelectStructureEntitiesCommand = () => {
  const { t } = useTranslation('common', { keyPrefix: 'structure-entities' });
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const {
    entityIds,
    typeIds,
    capability,
    excludeIds,
    descendantOf,
    includeArchived,
  } = useSelectStructureEntitiesContext();

  const { structureEntities, loading, error, handleFetchMore, totalCount } =
    useStructureEntities({
      variables: {
        searchValue: debouncedSearch,
        typeIds,
        capability,
        descendantOf,
        includeArchived,
        ...(excludeIds?.length ? { ids: excludeIds, excludeIds: true } : {}),
      },
      fetchPolicy: 'cache-and-network',
    });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={t('search')}
        focusOnMount
      />
      <Command.List>
        {entityIds.length > 0 && (
          <>
            <div className="flex flex-wrap justify-start p-2 gap-2">
              <StructureEntitiesList />
            </div>
            <Command.Separator />
          </>
        )}
        <SelectTree.Provider id="select-structure-entities" ordered={!search}>
          <Combobox.Empty loading={loading} error={error} />
          {getStructureEntityTree(structureEntities).map((node) => (
            <SelectStructureEntitiesItem key={node.entity._id} {...node} />
          ))}
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={structureEntities.length}
            totalCount={totalCount}
          />
        </SelectTree.Provider>
        {!loading && !error && structureEntities.length === 0 && (
          <SelectStructureEntitiesManage />
        )}
      </Command.List>
    </Command>
  );
};

export const SelectStructureEntitiesItem = ({
  entity,
  order,
  hasChildren,
}: IStructureEntityTreeNode) => {
  const { onSelect, entityIds } = useSelectStructureEntitiesContext();

  return (
    <SelectTree.Item
      _id={entity._id}
      value={entity._id}
      name={entity.title}
      order={order}
      hasChildren={hasChildren}
      selected={entityIds.includes(entity._id)}
      onSelect={() => onSelect(entity)}
    >
      <div className="flex overflow-hidden flex-auto gap-2 items-center">
        {entity.code && (
          <span className="text-muted-foreground">{entity.code}</span>
        )}
        <TextOverflowTooltip
          value={entity.title}
          className="flex-auto w-auto font-medium"
        />
        {entity.type?.name && (
          <Badge
            variant="secondary"
            className="shrink-0 font-normal text-muted-foreground"
          >
            {entity.type.name}
          </Badge>
        )}
      </div>
    </SelectTree.Item>
  );
};

export const StructureEntitiesList = ({
  placeholder,
  renderAsPlainText,
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof StructureEntityBadge>,
  'entity' | 'entityId' | 'onClose'
> & {
  placeholder?: string;
}) => {
  const { entityIds, selectedEntities, onRemove } =
    useSelectStructureEntitiesContext();

  if (entityIds.length === 0) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return (
    <>
      {entityIds.map((entityId) => (
        <StructureEntityBadge
          key={entityId}
          entityId={entityId}
          entity={selectedEntities.find(({ _id }) => _id === entityId)}
          renderAsPlainText={renderAsPlainText}
          showMissingId
          variant="secondary"
          className={cn('min-w-0', className)}
          onClose={() => onRemove(entityId)}
          {...props}
        />
      ))}
    </>
  );
};

export const SelectStructureEntitiesValue = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'structure-entities' });
  const { entityIds, mode } = useSelectStructureEntitiesContext();

  if (mode === 'multiple' && entityIds.length > 1) {
    return (
      <span className="text-muted-foreground">
        {t('selected-count', { count: entityIds.length })}
      </span>
    );
  }

  return (
    <StructureEntitiesList
      placeholder={placeholder ?? t('select')}
      renderAsPlainText={mode === 'single'}
    />
  );
};

export const SelectStructureEntitiesContent = () => {
  return <SelectStructureEntitiesCommand />;
};

export const SelectStructureEntitiesRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  TSelectStructureEntitiesProps &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      placeholder?: string;
      scope?: string;
    }
>(
  (
    {
      onValueChange,
      className,
      mode,
      value,
      placeholder,
      scope,
      typeIds,
      capability,
      excludeIds,
      descendantOf,
      includeArchived,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
      <SelectStructureEntitiesProvider
        mode={mode}
        value={value}
        typeIds={typeIds}
        capability={capability}
        excludeIds={excludeIds}
        descendantOf={descendantOf}
        includeArchived={includeArchived}
        onValueChange={(newValue) => {
          if (mode !== 'multiple') {
            setOpen(false);
          }
          onValueChange?.(newValue);
        }}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Combobox.Trigger
            className={cn('inline-flex w-full', className)}
            variant="outline"
            ref={ref}
            {...props}
          >
            <SelectStructureEntitiesValue placeholder={placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectStructureEntitiesContent />
          </Combobox.Content>
        </PopoverScoped>
      </SelectStructureEntitiesProvider>
    );
  },
);

SelectStructureEntitiesRoot.displayName = 'SelectStructureEntitiesRoot';

export const SelectStructureEntitiesInlineCell = ({
  onValueChange,
  placeholder,
  scope,
  ...props
}: TSelectStructureEntitiesProps & {
  placeholder?: string;
  scope?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectStructureEntitiesProvider
      onValueChange={(value) => {
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
        onValueChange?.(value);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectStructureEntitiesValue placeholder={placeholder} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectStructureEntitiesContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectStructureEntitiesProvider>
  );
};

const SelectStructureEntitiesBadgesView = () => {
  const { entityIds } = useSelectStructureEntitiesContext();

  if (entityIds.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <StructureEntitiesList variant="default" />
    </div>
  );
};

export const SelectStructureEntitiesDetail = React.forwardRef<
  React.ElementRef<typeof Button>,
  TSelectStructureEntitiesProps & {
    className?: string;
    scope?: string;
  }
>(({ onValueChange, className, scope, ...props }, ref) => {
  const { t } = useTranslation('common', { keyPrefix: 'structure-entities' });
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectStructureEntitiesProvider
      onValueChange={(value) => {
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
        onValueChange?.(value);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Popover.Trigger asChild>
          <Button
            ref={ref}
            className={cn(
              'w-min inline-flex text-sm font-medium shadow-xs',
              className,
            )}
            variant="outline"
          >
            {t('add')}
            <IconPlus className="text-lg" />
          </Button>
        </Popover.Trigger>
        <Combobox.Content className="mt-2">
          <SelectStructureEntitiesContent />
        </Combobox.Content>
      </PopoverScoped>
      <SelectStructureEntitiesBadgesView />
    </SelectStructureEntitiesProvider>
  );
});

SelectStructureEntitiesDetail.displayName = 'SelectStructureEntitiesDetail';

export const SelectStructureEntitiesCommandbarItem = ({
  onValueChange,
  ...props
}: TSelectStructureEntitiesProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'structure-entities' });
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectStructureEntitiesProvider
      onValueChange={(value) => {
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
        onValueChange?.(value);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant="secondary" asChild>
          <RecordTableInlineCell.Trigger>
            <IconHierarchy />
            {t('structure')}
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectStructureEntitiesContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectStructureEntitiesProvider>
  );
};

export const SelectStructureEntitiesComboboxItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: TSelectStructureEntitiesProps & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectStructureEntitiesProvider
      onValueChange={(value) => {
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
        onValueChange?.(value);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
          <SelectStructureEntitiesValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectStructureEntitiesContent />
        </Combobox.Content>
      </Popover>
    </SelectStructureEntitiesProvider>
  );
};

export const SelectStructureEntitiesFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: TSelectStructureEntitiesProps & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectStructureEntitiesProvider
      onValueChange={(value) => {
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
        onValueChange?.(value);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectStructureEntitiesValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectStructureEntitiesContent />
        </Combobox.Content>
      </Popover>
    </SelectStructureEntitiesProvider>
  );
};

export const SelectStructureEntitiesFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconHierarchy />
      {label}
    </Filter.Item>
  );
};

export const SelectStructureEntitiesFilterView = ({
  mode,
  filterKey,
  ...filter
}: IStructureEntitiesFilter & {
  mode: 'single' | 'multiple';
  filterKey: string;
}) => {
  const [query, setQuery] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectStructureEntitiesProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value);
          resetFilterState();
        }}
        {...filter}
      >
        <SelectStructureEntitiesContent />
      </SelectStructureEntitiesProvider>
    </Filter.View>
  );
};

export const SelectStructureEntitiesFilterBar = ({
  mode = 'multiple',
  filterKey,
  label,
  ...filter
}: IStructureEntitiesFilter & {
  mode?: 'single' | 'multiple';
  filterKey: string;
  label: string;
}) => {
  const [query, setQuery] = useQueryState<string[] | string>(filterKey);
  const [open, setOpen] = useState<boolean>(false);

  if (!query) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconHierarchy />
        {label}
      </Filter.BarName>
      <SelectStructureEntitiesProvider
        mode={mode}
        value={query}
        onValueChange={(value) => {
          setQuery(value?.length ? value : null);
          setOpen(false);
        }}
        {...filter}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={filterKey}>
              <SelectStructureEntitiesValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectStructureEntitiesContent />
          </Combobox.Content>
        </Popover>
      </SelectStructureEntitiesProvider>
    </Filter.BarItem>
  );
};

export const SelectStructureEntities = Object.assign(
  SelectStructureEntitiesProvider,
  {
    Root: SelectStructureEntitiesRoot,
    Provider: SelectStructureEntitiesProvider,
    CommandBarItem: SelectStructureEntitiesCommandbarItem,
    Content: SelectStructureEntitiesContent,
    Command: SelectStructureEntitiesCommand,
    Item: SelectStructureEntitiesItem,
    Value: SelectStructureEntitiesValue,
    List: StructureEntitiesList,
    InlineCell: SelectStructureEntitiesInlineCell,
    ComboboxItem: SelectStructureEntitiesComboboxItem,
    FormItem: SelectStructureEntitiesFormItem,
    FilterItem: SelectStructureEntitiesFilterItem,
    FilterView: SelectStructureEntitiesFilterView,
    FilterBar: SelectStructureEntitiesFilterBar,
    Detail: SelectStructureEntitiesDetail,
    Badge: StructureEntityBadge,
    Inline: StructureEntitiesInline,
  },
);
