import { IconChartPie } from '@tabler/icons-react';
import {
  Badge,
  Combobox,
  Command,
  Filter,
  Popover,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectSegments } from '../hooks/useSelectSegments';
import { ISegment } from '../types';

const SegmentMembers = ({ segment }: { segment: ISegment }) => {
  const { t } = useTranslation('segment', { keyPrefix: 'filter' });

  if (segment.status === 'building') {
    return (
      <Badge variant="secondary" className="shrink-0">
        {t('building')}
      </Badge>
    );
  }

  if (segment.membersCount === undefined || segment.membersCount === null) {
    return null;
  }

  return (
    <span className="text-muted-foreground shrink-0">
      {segment.membersCount}
    </span>
  );
};

const SegmentsFilterList = ({
  contentType,
  selected,
  onSelect,
}: {
  contentType: string;
  selected: string[];
  onSelect: (ids: string[]) => void;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'filter' });
  const { segments, loading, error, inputRef, search, setSearch } =
    useSelectSegments({ contentType, focusOnMount: true });

  const toggle = (segmentId: string) =>
    onSelect(
      selected.includes(segmentId)
        ? selected.filter((id) => id !== segmentId)
        : [...selected, segmentId],
    );

  return (
    <Command shouldFilter={false}>
      <Command.Input
        variant="secondary"
        placeholder={t('search-segments')}
        ref={inputRef}
        value={search}
        onValueChange={setSearch}
      />
      <Command.Separator />
      <Command.List className="p-1 max-h-64">
        <Combobox.Empty error={error} loading={loading} />
        {segments.map((segment: ISegment) => (
          <Command.Item
            key={segment._id}
            value={segment._id}
            onSelect={() => toggle(segment._id)}
          >
            <div className="flex items-center gap-2 flex-auto overflow-hidden">
              <TextOverflowTooltip value={segment.name} className="flex-auto" />
            </div>
            <SegmentMembers segment={segment} />
            <Combobox.Check checked={selected.includes(segment._id)} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const SegmentsFilterCommandItem = () => {
  const { t } = useTranslation('segment', { keyPrefix: 'filter' });

  return (
    <Filter.Item value="segments">
      <IconChartPie />
      {t('segments')}
    </Filter.Item>
  );
};

export const SegmentsFilterView = ({
  contentType,
}: {
  contentType: string;
}) => {
  const [segments, setSegments] = useQueryState<string[]>('segments');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="segments">
      <SegmentsFilterList
        contentType={contentType}
        selected={segments || []}
        onSelect={(ids) => {
          setSegments(ids.length ? ids : null);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const SelectedSegments = ({
  contentType,
  selected,
}: {
  contentType: string;
  selected: string[];
}) => {
  const { segments } = useSelectSegments({ contentType });

  const names = selected.map(
    (id) =>
      segments.find((segment: ISegment) => segment._id === id)?.name || id,
  );

  return (
    <div className="flex items-center gap-1 overflow-hidden">
      <TextOverflowTooltip value={names[0]} />
      {names.length > 1 && (
        <Badge variant="secondary">+{names.length - 1}</Badge>
      )}
    </div>
  );
};

const SegmentsFilterBar = ({ contentType }: { contentType: string }) => {
  const { t } = useTranslation('segment', { keyPrefix: 'filter' });
  const [segments, setSegments] = useQueryState<string[]>('segments');
  const [open, setOpen] = useState(false);

  if (!segments?.length) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="segments">
      <Filter.BarName>
        <IconChartPie />
        {t('segments')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton
            filterKey="segments"
            className="max-w-72 overflow-hidden justify-start"
          >
            <SelectedSegments contentType={contentType} selected={segments} />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content className="w-72">
          <SegmentsFilterList
            contentType={contentType}
            selected={segments}
            onSelect={(ids) => setSegments(ids.length ? ids : null)}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const SegmentsFilter = Object.assign(SegmentsFilterCommandItem, {
  Bar: SegmentsFilterBar,
  View: SegmentsFilterView,
});
