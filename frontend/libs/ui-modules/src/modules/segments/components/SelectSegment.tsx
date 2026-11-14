import {
  Badge,
  Combobox,
  Command,
  Popover,
  SelectTree,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useSelectSegment } from '../hooks/useSelectSegment';
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
  const {
    segments,
    loading,
    error,
    inputRef,
    selectedSegment,
    setSearch,
    search,
    triggerKind,
    firstSelectedName,
    moreSelectedCount,
    isChecked,
    nameOf,
    handleSelect,
  } = useSelectSegment({
    selected,
    onSelect,
    mode,
    exclude,
    focusOnMount,
    contentType,
    unnamedLabel,
  });

  return (
    <Popover>
      <Combobox.Trigger>
        {triggerKind === 'multiple' && (
          <div className="flex items-center gap-1 flex-auto overflow-hidden">
            <TextOverflowTooltip
              value={firstSelectedName}
              className="flex-auto"
            />
            {moreSelectedCount > 0 && (
              <Badge variant="secondary">+{moreSelectedCount}</Badge>
            )}
          </div>
        )}
        {triggerKind === 'single' && (
          <SelectBranchBadge
            segment={selectedSegment}
            totalCount={segments.length}
            unnamedLabel={unnamedLabel}
          />
        )}
        {triggerKind === 'empty' && (
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
                  name={nameOf(segment)}
                  value={segment._id}
                  onSelect={handleSelect}
                  selected={false}
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
                    {isChecked(segment._id) && <Combobox.Check checked />}
                    <TextOverflowTooltip
                      value={nameOf(segment)}
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
