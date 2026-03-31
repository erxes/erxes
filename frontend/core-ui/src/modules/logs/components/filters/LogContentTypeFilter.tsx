import { useQuery } from '@apollo/client';
import { LOGS_GET_CONTENT_TYPES } from '@/logs/graphql/logQueries';
import { LogsGetContentTypesQueryResponse } from '@/logs/types';
import {
  formatLogContentTypeLabel,
  formatLogContentTypeSegmentLabel,
} from '@/logs/constants/logFilter';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, useMultiQueryState } from 'erxes-ui';
import { useState } from 'react';

export const LogContentTypeFilter = () => {
  const [queries, setQueries] = useMultiQueryState<{
    contentType: string;
    contentTypeOperator: string;
  }>(['contentType', 'contentTypeOperator']);
  const { contentType } = queries;
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
    filteredOptions.reduce<
      Record<
        string,
        Record<
          string,
          Array<{
            value: string;
            pluginName: string;
            moduleName: string;
            collectionName: string;
          }>
        >
      >
    >((acc, option) => {
      const pluginKey = option.pluginName;
      const moduleKey = option.moduleName;

      acc[pluginKey] = acc[pluginKey] || {};
      acc[pluginKey][moduleKey] = acc[pluginKey][moduleKey] || [];
      acc[pluginKey][moduleKey].push(option);

      return acc;
    }, {}),
  );

  return (
    <Command shouldFilter={false}>
      <Command.Input
        placeholder="Search content type"
        value={search}
        onValueChange={setSearch}
      />
      <Command.List className="p-1">
        <Combobox.Empty loading={loading} error={error} />
        {groupedOptions.map(([pluginName, modules], pluginIndex) => (
          <div key={pluginName}>
            <Command.Group
              heading={formatLogContentTypeSegmentLabel(pluginName)}
            >
              {Object.entries(modules).map(([moduleName, items]) => (
                <div
                  key={`${pluginName}:${moduleName}`}
                  className="pb-1 last:pb-0"
                >
                  <div className="px-2 pt-1 pb-1 text-[11px] font-medium text-muted-foreground">
                    {formatLogContentTypeSegmentLabel(moduleName)}
                  </div>
                  {items.map(({ value, collectionName }) => (
                    <Command.Item
                      key={value}
                      value={value}
                      className="cursor-pointer pl-4"
                      onSelect={() =>
                        setQueries({
                          contentType: value === contentType ? null : value,
                          contentTypeOperator: null,
                        })
                      }
                    >
                      {formatLogContentTypeSegmentLabel(collectionName)}
                      {contentType === value && (
                        <IconCheck className="ml-auto" />
                      )}
                    </Command.Item>
                  ))}
                </div>
              ))}
            </Command.Group>
            {pluginIndex < groupedOptions.length - 1 && (
              <Command.Separator className="my-1" />
            )}
          </div>
        ))}
      </Command.List>
    </Command>
  );
};
