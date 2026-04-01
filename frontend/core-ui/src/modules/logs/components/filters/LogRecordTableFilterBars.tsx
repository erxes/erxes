import { SelectMember } from 'ui-modules';
import { Filter, Input, Popover, useMultiQueryState } from 'erxes-ui';
import {
  IconCalendarPlus,
  IconHash,
  IconProgressCheck,
  IconSourceCode,
  IconTag,
} from '@tabler/icons-react';

import {
  formatLogContentTypeLabel,
  LOGS_COMMON_FILTER_FIELD_NAMES,
} from '@/logs/constants/logFilter';
import { LogActionsFilter } from './LogActionFilter';
import { LogContentTypeFilter } from './LogContentTypeFilter';
import { LogDocIdFilter } from './LogDocIdFilter';
import { LogRecordTableFilterBarOperator } from './LogRecordTableFilterBarOperator';
import { LogSourceFilter } from './LogSourceFilter';
import { LogStatusFilter } from './LogStatusFilter';
import { useSearchParams } from 'react-router';
import { useState } from 'react';

const getCustomFilters = (searchParams: URLSearchParams) => {
  const paramKeys = Array.from(searchParams.keys());

  const customFilterFields = paramKeys.filter(
    (key) => !LOGS_COMMON_FILTER_FIELD_NAMES.includes(key),
  );

  return customFilterFields
    .filter((field) => !field.includes('Operator'))
    .map((customFilterField) => ({
      name: customFilterField,
      value: searchParams.get(customFilterField),
    }));
};

const getCustomFilterDisplayValue = (value?: string | null) => {
  if (!value?.trim()) {
    return 'Set value';
  }

  return value;
};

export const LogRecordTableFilterBars = () => {
  const [editingFields, setFieldAsEdit] = useState(
    {} as { [key: string]: boolean },
  );
  const [searchParams] = useSearchParams();

  const [queries, setQueries] = useMultiQueryState<{
    status: string;
    source: string;
    action: string;
    userIds: string[];
    createdAt: string;
    contentType: string;
    docId: string;
  }>([
    'status',
    'source',
    'action',
    'userIds',
    'createdAt',
    'contentType',
    'docId',
  ]);
  const { status, source, action, contentType, docId } = queries;

  const customFilters = getCustomFilters(searchParams);

  return (
    <Filter.Bar>
      <Filter.BarItem queryKey="status">
        <Filter.BarName>
          <IconProgressCheck />
          Status
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton filterKey="status">{status}</Filter.BarButton>
          </Popover.Trigger>
          <Popover.Content>
            <LogStatusFilter />
          </Popover.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="source">
        <Filter.BarName>
          <IconSourceCode />
          Source
        </Filter.BarName>

        <Popover>
          <Popover.Trigger>
            <Filter.BarButton filterKey="source">{source}</Filter.BarButton>
          </Popover.Trigger>
          <Popover.Content>
            <LogSourceFilter />
          </Popover.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendarPlus />
          Created At
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <Filter.BarItem queryKey="action">
        <Filter.BarName>
          <IconProgressCheck />
          Action
        </Filter.BarName>

        <Popover>
          <Popover.Trigger>
            <Filter.BarButton filterKey="action">{action}</Filter.BarButton>
          </Popover.Trigger>
          <Popover.Content>
            <LogActionsFilter />
          </Popover.Content>
        </Popover>
      </Filter.BarItem>

      <SelectMember.FilterBar queryKey="userIds" />

      <Filter.BarItem queryKey="contentType">
        <Filter.BarName>
          <IconTag />
          Content Type
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton filterKey="contentType">
              {formatLogContentTypeLabel(contentType)}
            </Filter.BarButton>
          </Popover.Trigger>
          <Popover.Content>
            <LogContentTypeFilter />
          </Popover.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="docId">
        <Filter.BarName>
          <IconHash />
          Document ID
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton filterKey="docId">{docId}</Filter.BarButton>
          </Popover.Trigger>
          <Popover.Content>
            <LogDocIdFilter />
          </Popover.Content>
        </Popover>
      </Filter.BarItem>

      {customFilters.map(({ name, value }) => (
        <div
          key={name}
          className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium"
        >
          <Filter.BarName
            onDoubleClick={() =>
              setFieldAsEdit({ ...editingFields, [name]: !editingFields[name] })
            }
          >
            {editingFields[name] ? (
              <Input
                placeholder="Type a filter name "
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setQueries({
                      [e.currentTarget.value]: value,
                      [name]: null,
                    });
                  }
                }}
              />
            ) : (
              name
            )}
          </Filter.BarName>
          <LogRecordTableFilterBarOperator fieldName={name as any} />
          <Popover>
            <Popover.Trigger>
              <Filter.BarButton filterKey={name}>
                {getCustomFilterDisplayValue(value)}
              </Filter.BarButton>
            </Popover.Trigger>
            <Popover.Content>
              <Input
                className="p-2m mt-2"
                placeholder="Type a filter value "
                defaultValue={value || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setQueries({ [name]: e.currentTarget.value });
                  }
                }}
              />
            </Popover.Content>
          </Popover>
          <Filter.BarClose filterKey={name} />
        </div>
      ))}
    </Filter.Bar>
  );
};
