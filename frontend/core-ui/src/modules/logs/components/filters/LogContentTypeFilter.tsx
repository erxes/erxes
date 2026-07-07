import { useQuery } from '@apollo/client';
import { LOGS_GET_CONTENT_TYPES } from '@/logs/graphql/logQueries';
import { LogsGetContentTypesQueryResponse } from '@/logs/types';
import {
  formatLogContentTypeLabel,
  formatLogContentTypeSegmentLabel,
} from '@/logs/constants/logFilter';
import { IconCheck } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  useFilterContext,
  useMultiQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ContentTypeOption {
  value: string;
  pluginName: string;
  moduleName: string;
  collectionName: string;
}

const LogContentTypeItem = ({
  value,
  collectionName,
  isSelected,
  onSelect,
}: {
  value: string;
  collectionName: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}) => (
  <Command.Item
    value={value}
    className="cursor-pointer pl-4"
    onSelect={() => onSelect(value)}
  >
    {formatLogContentTypeSegmentLabel(collectionName)}
    {isSelected && <IconCheck className="ml-auto" />}
  </Command.Item>
);

const LogContentTypeModuleGroup = ({
  moduleName,
  items,
  contentType,
  onSelect,
}: {
  moduleName: string;
  items: ContentTypeOption[];
  contentType: string | null;
  onSelect: (value: string) => void;
}) => (
  <div className="pb-1 last:pb-0">
    <div className="px-2 pt-1 pb-1 text-[11px] font-medium text-muted-foreground">
      {formatLogContentTypeSegmentLabel(moduleName)}
    </div>
    {items.map(({ value, collectionName }) => (
      <LogContentTypeItem
        key={value}
        value={value}
        collectionName={collectionName}
        isSelected={contentType === value}
        onSelect={onSelect}
      />
    ))}
  </div>
);

const LogContentTypePluginGroup = ({
  pluginName,
  modules,
  contentType,
  onSelect,
  showSeparator,
}: {
  pluginName: string;
  modules: Record<string, ContentTypeOption[]>;
  contentType: string | null;
  onSelect: (value: string) => void;
  showSeparator: boolean;
}) => (
  <div>
    <Command.Group heading={formatLogContentTypeSegmentLabel(pluginName)}>
      {Object.entries(modules).map(([moduleName, items]) => (
        <LogContentTypeModuleGroup
          key={`${pluginName}:${moduleName}`}
          moduleName={moduleName}
          items={items}
          contentType={contentType}
          onSelect={onSelect}
        />
      ))}
    </Command.Group>
    {showSeparator && <Command.Separator className="my-1" />}
  </div>
);

/** Searchable command list for picking a log content type grouped by plugin. */
export const LogContentTypeFilter = ({
  onValueChange,
}: {
  onValueChange?: () => void;
}) => {
  const { t } = useTranslation('common');
  const [queries, setQueries] = useMultiQueryState<{
    contentType: string;
    contentTypeOperator: string;
  }>(['contentType', 'contentTypeOperator']);
  const { contentType } = queries;
  const { resetFilterState } = useFilterContext();
  const [search, setSearch] = useState('');
  const { data, loading, error } = useQuery<LogsGetContentTypesQueryResponse>(
    LOGS_GET_CONTENT_TYPES,
  );

  const options = data?.logsGetContentTypes || [];
  const normalizedSearch = search.trim().toLowerCase();

  const filteredOptions = options.filter((option) => {
    if (!normalizedSearch) {
      return true;
    }

    const searchValue = [
      option.value,
      option.pluginName,
      option.moduleName,
      option.collectionName,
      formatLogContentTypeLabel(option.value),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchValue.includes(normalizedSearch);
  });

  const groupedOptions = Object.entries(
    filteredOptions.reduce<Record<string, Record<string, ContentTypeOption[]>>>(
      (acc, option) => {
        const pluginKey = option.pluginName;
        const moduleKey = option.moduleName;

        acc[pluginKey] = acc[pluginKey] || {};
        acc[pluginKey][moduleKey] = acc[pluginKey][moduleKey] || [];
        acc[pluginKey][moduleKey].push(option);

        return acc;
      },
      {},
    ),
  );

  const handleSelect = (value: string) => {
    setQueries({
      contentType: value === contentType ? null : value,
      contentTypeOperator: null,
    });
    resetFilterState();
    onValueChange?.();
  };

  return (
    <Command shouldFilter={false}>
      <Command.Input
        placeholder={t('logs.searchContentType')}
        value={search}
        onValueChange={setSearch}
      />
      <Command.List className="p-1">
        <Combobox.Empty loading={loading} error={error} />
        {groupedOptions.map(([pluginName, modules], pluginIndex) => (
          <LogContentTypePluginGroup
            key={pluginName}
            pluginName={pluginName}
            modules={modules}
            contentType={contentType}
            onSelect={handleSelect}
            showSeparator={pluginIndex < groupedOptions.length - 1}
          />
        ))}
      </Command.List>
    </Command>
  );
};
