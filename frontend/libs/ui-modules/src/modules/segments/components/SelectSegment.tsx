import { useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { SEGMENTS } from '../graphql/queries';
import { useQueryState } from 'erxes-ui';
import { ISegment } from '../types';
import { Combobox, Command, Popover, TextOverflowTooltip } from 'erxes-ui';
import { SelectTree } from 'erxes-ui';
import { useSelectSegments } from '../hooks/useSelectSegments';
import { generateOrderPath } from '../utils/segmentsUtils';

const SelectBranchBadge = ({
  segment,
  selected,
  totalCount,
}: {
  totalCount: number;
  segment?: ISegment;
  selected?: boolean;
}) => {
  if (!segment) return null;

  const { name } = segment || {};

  return (
    <>
      <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
        <TextOverflowTooltip value={name} className="flex-auto" />
      </div>
      {!selected ? (
        totalCount > 0 && (
          <div className="text-muted-foreground ml-auto">{totalCount}</div>
        )
      ) : (
        <Combobox.Check checked={selected} />
      )}
    </>
  );
};

export const SelectSegment = ({
  selected,
  onSelect,
  focusOnMount,
  nullable,
  exclude,
  disabled,
}: {
  selected?: string;
  onSelect: (categoryId: string | null) => void;
  focusOnMount?: boolean;
  nullable?: boolean;
  exclude?: string[];
  disabled?: boolean;
}) => {
  const {
    segments,
    loading,
    error,
    inputRef,
    selectedSegment,
    setSearch,
    search,
  } = useSelectSegments({ selected, exclude, focusOnMount });

  return (
    <Popover>
      <Combobox.Trigger>
        {selectedSegment ? (
          <SelectBranchBadge
            segment={selectedSegment}
            totalCount={segments?.length || 0}
          />
        ) : (
          <Combobox.Value placeholder="Select a segment" />
        )}
      </Combobox.Trigger>
      <Combobox.Content>
        <SelectTree.Provider id="select-segment" ordered>
          <Command shouldFilter={false}>
            <Command.Input
              variant="secondary"
              placeholder="Search a segment"
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
            />
            <Command.Separator />
            <Command.List className="p-1">
              <Combobox.Empty error={error} loading={loading} />
              {nullable && (
                <Command.Item
                  key="null"
                  value="null"
                  onSelect={() => onSelect(null)}
                >
                  No segment selected
                </Command.Item>
              )}
              {segments.map((segment: any, index: number) => (
                <SelectTree.Item
                  _id={segment._id}
                  order={segment.order}
                  hasChildren={segment.hasChildren}
                  name={segment.name}
                  value={segment._id}
                  onSelect={onSelect}
                  selected={false}
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
                    {selected === segment._id && <Combobox.Check checked />}
                    <TextOverflowTooltip
                      value={segment.name}
                      className="flex-auto"
                    />
                  </div>
                </SelectTree.Item>
              ))}
            </Command.List>
          </Command>
        </SelectTree.Provider>
      </Combobox.Content>
    </Popover>
  );
};
