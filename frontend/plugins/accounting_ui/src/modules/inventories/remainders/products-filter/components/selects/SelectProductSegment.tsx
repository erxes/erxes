import { Combobox, Command, Filter, Popover, useFilterContext, useFilterQueryState } from 'erxes-ui';
import { PRODUCTS_CURSOR_SESSION_KEY } from '../../../constants/productsCursorSessionKey';
import { IconCheck, IconTag } from '@tabler/icons-react';
import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

const GET_SEGMENTS = gql`
  query AccountingProductSegments($contentTypes: [String]!) {
    segments(contentTypes: $contentTypes) {
      _id
      name
      color
    }
  }
`;

interface ISegment {
  _id: string;
  name: string;
  color?: string;
}

function useProductSegments() {
  const { data, loading } = useQuery<{ segments: ISegment[] }>(GET_SEGMENTS, {
    variables: { contentTypes: ['core:product'] },
  });
  return { segments: data?.segments ?? [], loading };
}

function SegmentDot({ color }: Readonly<{ color?: string }>) {
  if (!color) return null;
  return <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />;
}

function SegmentCommandList({
  segments,
  loading,
  selectedId,
  onSelect,
}: Readonly<{
  segments: ISegment[];
  loading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}>) {
  if (loading) return <Combobox.Empty loading />;
  if (!segments.length) return <Command.Empty>No segments found</Command.Empty>;
  return (
    <>
      {segments.map((seg) => (
        <Command.Item key={seg._id} value={seg._id} onSelect={() => onSelect(seg._id)}>
          <div className="flex items-center gap-2">
            <SegmentDot color={seg.color} />
            <span>{seg.name}</span>
          </div>
          {selectedId === seg._id && <IconCheck size={14} />}
        </Command.Item>
      ))}
    </>
  );
}

export function SelectProductSegmentFilterItem() {
  return (
    <Filter.Item value="segment">
      <IconTag size={14} />
      Segment
    </Filter.Item>
  );
}

export function SelectProductSegmentFilterView() {
  const { resetFilterState, sessionKey } = useFilterContext();
  const [segment, setSegment] = useFilterQueryState<string>('segment', sessionKey);
  const { segments, loading } = useProductSegments();

  return (
    <Filter.View filterKey="segment">
      <Command className="outline-hidden">
        <Command.Input placeholder="Search segments" />
        <Command.List>
          <SegmentCommandList
            segments={segments}
            loading={loading}
            selectedId={segment ?? undefined}
            onSelect={(id) => {
              setSegment(id);
              resetFilterState();
            }}
          />
        </Command.List>
      </Command>
    </Filter.View>
  );
}

export function SelectProductSegmentFilterBar() {
  const [segment, setSegment] = useFilterQueryState<string>('segment', PRODUCTS_CURSOR_SESSION_KEY);
  const [open, setOpen] = useState(false);
  const { segments, loading } = useProductSegments();

  if (!segment) return null;

  const selected = segments.find((s) => s._id === segment);

  return (
    <Filter.BarItem queryKey="segment">
      <Filter.BarName>
        <IconTag size={14} />
        Segment
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="segment">
            {selected ? (
              <div className="flex items-center gap-2">
                <SegmentDot color={selected.color} />
                <span>{selected.name}</span>
              </div>
            ) : (
              <Combobox.Value placeholder="Select segment" />
            )}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command className="outline-hidden">
            <Command.Input placeholder="Search segments" />
            <Command.List>
              <SegmentCommandList
                segments={segments}
                loading={loading}
                selectedId={segment ?? undefined}
                onSelect={(id) => {
                  setSegment(id);
                  setOpen(false);
                }}
              />
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
}
