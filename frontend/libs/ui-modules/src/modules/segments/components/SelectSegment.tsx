import { useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { SEGMENTS } from '../graphql/queries';
import { useQueryState } from 'erxes-ui';
import { ISegment } from '../types';
import { Combobox, Command, Popover, TextOverflowTooltip } from 'erxes-ui';
import { SelectTree } from 'erxes-ui';

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
}: {
  selected?: string;
  onSelect: (categoryId: string | null) => void;
  focusOnMount?: boolean;
  nullable?: boolean;
  exclude?: string[];
}) => {
  const [search, setSearch] = useState('');
  const [contentType] = useQueryState('contentType');
  const [debouncedSearch] = useDebounce(search, 500);
  const { data, loading, error } = useQuery(SEGMENTS, {
    variables: {
      contentTypes: [contentType],
      searchValue: debouncedSearch ?? undefined,
      ids: selected ? [selected] : undefined,
      excludeIds: exclude,
    },
    skip: !contentType,
  });

  const { segments = [] } = data || {};
  const selectedSegment = segments?.find(
    (segment: ISegment) => segment._id === selected,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && focusOnMount) {
      inputRef.current.focus();
    }
  }, [focusOnMount]);

  function generateOrderPath(items: ISegment[]) {
    const map = new Map(items.map((item) => [item._id, item]));

    const childrenMap = new Map();

    items.forEach((item) => {
      if (item.subOf) {
        if (!childrenMap.has(item.subOf)) {
          childrenMap.set(item.subOf, []);
        }
        childrenMap.get(item.subOf).push(item._id);
      }
    });

    const getOrder = (_id: string): any => {
      const item = map.get(_id);
      if (!item) return '';
      if (!item.subOf) return _id;
      return `${getOrder(item.subOf)}/${_id}`;
    };

    return items.map((item) => ({
      ...item,
      order: getOrder(item._id || ''),
      hasChildren: childrenMap.has(item._id),
    }));
  }

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
              onValueChange={(value) => setSearch(value)}
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
              {generateOrderPath(segments)?.map(
                (segment: any, index: number) => (
                  <SelectTree.Item
                    // id={index.toString()}
                    order={segment.order}
                    hasChildren={segment.hasChildren}
                    name={segment.name}
                    value={segment._id}
                    onSelect={onSelect}
                    selected={false}
                    // disabled={disabled}
                  >
                    <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
                      {selected === segment._id && <Combobox.Check checked />}
                      <TextOverflowTooltip
                        value={segment.name}
                        className="flex-auto"
                      />
                    </div>
                  </SelectTree.Item>
                ),
              )}
            </Command.List>
          </Command>
        </SelectTree.Provider>
      </Combobox.Content>
    </Popover>
  );
};
