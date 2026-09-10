import {
  Badge,
  Combobox,
  Command,
  Popover,
  SelectTree,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useSelectSegments } from '../hooks/useSelectSegments';
import { ISegment } from '../types';

const SelectBranchBadge = ({
  segment,
  selected,
  totalCount,
  unnamedLabel,
}: {
  totalCount: number;
  segment?: ISegment;
  selected?: boolean;
  unnamedLabel: string;
}) => {
  if (!segment) return null;

  const name = segment.name || unnamedLabel;

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
  mode = 'single',
  focusOnMount,
  nullable,
  exclude,
  disabled,
  contentType,
  unnamedLabel = 'Untitled segment',
}: {
  selected?: string | string[];
  onSelect: (categoryId: string | string[] | null) => void;
  mode?: 'single' | 'multiple';
  focusOnMount?: boolean;
  nullable?: boolean;
  exclude?: string[];
  disabled?: boolean;
  contentType?: string;
  unnamedLabel?: string;
}) => {
  const selectedIds = Array.isArray(selected)
    ? selected
    : selected
      ? [selected]
      : [];
  const isMultiple = mode === 'multiple';
  const {
    segments,
    loading,
    error,
    inputRef,
    selectedSegment,
    setSearch,
    search,
  } = useSelectSegments({
    selected: isMultiple ? selectedIds[0] : selectedIds[0],
    exclude,
    focusOnMount,
    contentType,
  });

  const selectedSegments = isMultiple
    ? selectedIds
        .map((id) => segments.find((segment: ISegment) => segment._id === id))
        .filter(Boolean)
    : [];

  const handleSelect = (segmentId: string | null) => {
    if (!isMultiple) {
      onSelect(segmentId);
      return;
    }

    if (!segmentId) {
      onSelect([]);
      return;
    }

    onSelect(
      selectedIds.includes(segmentId)
        ? selectedIds.filter((id) => id !== segmentId)
        : [...selectedIds, segmentId],
    );
  };

  return (
    <Popover>
      <Combobox.Trigger>
        {isMultiple && selectedSegments.length ? (
          <div className="flex items-center gap-1 flex-auto overflow-hidden">
            <TextOverflowTooltip
              value={selectedSegments[0]?.name || unnamedLabel}
              className="flex-auto"
            />
            {selectedSegments.length > 1 && (
              <Badge variant="secondary">+{selectedSegments.length - 1}</Badge>
            )}
          </div>
        ) : selectedSegment ? (
          <SelectBranchBadge
            segment={selectedSegment}
            totalCount={segments?.length || 0}
            unnamedLabel={unnamedLabel}
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
                  onSelect={() => handleSelect(null)}
                >
                  No segment selected
                </Command.Item>
              )}
              {segments.map((segment: ISegment) => (
                <SelectTree.Item
                  key={segment._id}
                  _id={segment._id}
                  order={segment._id}
                  hasChildren={false}
                  name={segment.name || unnamedLabel}
                  value={segment._id}
                  onSelect={handleSelect}
                  selected={false}
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
                    {selectedIds.includes(segment._id) && (
                      <Combobox.Check checked />
                    )}
                    <TextOverflowTooltip
                      value={segment.name || unnamedLabel}
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
