import { Button, Dialog, Input, Command, cn, useFilterContext } from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { toggleFilterValue, toFilterIds } from '@/ticket/utils/filterValues';
import { ReportDateFilterMenu as DateView } from '../ReportDateFilterMenu';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStateTicket } from '@/ticket/components/ticket-selects/SelectStateTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { FREQUENCY_OPTIONS } from '@/report/constants/ticketFilters';

export const TicketReportFilterCommand = ({ children }: PropsWithChildren) => (
  <Command shouldFilter={false}>{children}</Command>
);

export const DateFilterView = ({
  filterKey,
  label,
  value,
  onChange,
  onClose,
}: {
  filterKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}) => {
  const { setOpen } = useFilterContext();
  const close = onClose || (() => setOpen(false));
  return (
    <DateView
      filterKey={filterKey}
      label={label}
      selected={value}
      onClose={close}
      onSelect={(selected) => {
        onChange(selected);
        close();
      }}
    />
  );
};

export const MemberFilterView = ({
  value,
  onValueChange,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
}) => (
  <SelectAssigneeTicket.Provider
    value={value}
    mode="multiple"
    onValueChange={(selected) => onValueChange(toFilterIds(selected))}
  >
    <SelectAssigneeTicket.Content showUnassigned={false} />
  </SelectAssigneeTicket.Provider>
);

export const PipelineFilterView = ({
  value,
  onValueChange,
  channelIds,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  channelIds: string[];
}) => {
  const { pipelines, loading } = useGetPipelines({
    variables: {
      filter: {
        channelId: channelIds[0],
        applyVisibilityFilter: true,
      },
    },
    skip: channelIds.length === 0,
  });

  const { t: tPipeline } = useTranslation('frontline');
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {loading ? (
        <Command.Empty>{tPipeline('loading')}</Command.Empty>
      ) : (
        <>
          <Command.Item value="all" onSelect={() => onValueChange([])}>
            <div className="flex items-center gap-2">
              {value.length === 0 && <IconCheck className="size-4" />}
              <span>{tPipeline('all-pipelines')}</span>
            </div>
          </Command.Item>
          {pipelines?.map((pipeline) => (
            <Command.Item
              key={pipeline._id}
              value={pipeline._id}
              onSelect={() =>
                onValueChange(toggleFilterValue(value, pipeline._id))
              }
            >
              <div className="flex items-center gap-2">
                {value.includes(pipeline._id) && (
                  <IconCheck className="size-4" />
                )}
                <span>{pipeline.name}</span>
              </div>
            </Command.Item>
          ))}
        </>
      )}
    </Command.List>
  );
};

export const TicketStatusFilterView = ({
  value,
  onValueChange,
  pipelineId,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  pipelineId?: string;
}) => (
  <SelectStatusTicket.Provider
    value={value[0] || ''}
    selectedValues={value}
    pipelineId={pipelineId}
    onValueChange={(selected) =>
      onValueChange(toggleFilterValue(value, selected))
    }
  >
    <SelectStatusTicket.Content onClear={() => onValueChange([])} />
  </SelectStatusTicket.Provider>
);

export const StateFilterView = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <SelectStateTicket.Provider value={value} onValueChange={onValueChange}>
    <SelectStateTicket.Content includeAll />
  </SelectStateTicket.Provider>
);

export const PriorityFilterView = ({
  value,
  onValueChange,
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
}) => (
  <SelectPriorityTicket.Provider
    value={value[0] ?? 0}
    selectedValues={value}
    onValueChange={(selected) =>
      onValueChange(toggleFilterValue(value, selected))
    }
  >
    <SelectPriorityTicket.Content onClear={() => onValueChange([])} />
  </SelectPriorityTicket.Provider>
);

export const FrequencyFilterView = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {FREQUENCY_OPTIONS.map((option) => (
        <Command.Item
          key={option.value}
          value={option.value}
          onSelect={() => onValueChange(option.value)}
        >
          <div className={cn('flex items-center gap-2')}>
            {value === option.value && <IconCheck className="size-4" />}
            <span>{t(option.label)}</span>
          </div>
        </Command.Item>
      ))}
    </Command.List>
  );
};

export const DescriptionFilterDialog = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { setDialogView, setOpenDialog } = useFilterContext();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <Dialog.Content>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onChange(draft.trim());
          setDialogView('root');
          setOpenDialog(false);
        }}
      >
        <Dialog.Header>
          <Dialog.Title>{t('description', 'Description')}</Dialog.Title>
        </Dialog.Header>
        <Input
          aria-label={t('description', 'Description')}
          className="my-4"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">{t('cancel', 'Cancel')}</Button>
          </Dialog.Close>
          <Button type="submit">{t('apply', 'Apply')}</Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
};
