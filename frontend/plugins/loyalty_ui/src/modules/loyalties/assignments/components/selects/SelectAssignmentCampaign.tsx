import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconTag } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { QUERY_ASSIGNMENT_CAMPAIGNS_SIMPLE } from '../../graphql/queries';

interface Option {
  value: string;
  label: string;
}

const useAssignmentCampaignOptions = () => {
  const { data, loading } = useQuery(QUERY_ASSIGNMENT_CAMPAIGNS_SIMPLE, {
    variables: { limit: 50 },
  });

  const options = useMemo<Option[]>(
    () =>
      (data?.assignmentCampaigns?.list || []).map(
        (c: { _id: string; title: string }) => ({
          value: c._id,
          label: c.title,
        }),
      ),
    [data?.assignmentCampaigns?.list],
  );

  return { options, loading };
};

export const SelectAssignmentCampaignFilterItem = () => (
  <Filter.Item value="assignmentCampaignId">
    <IconTag />
    Campaign
  </Filter.Item>
);

export const SelectAssignmentCampaignFilterView = ({
  queryKey = 'assignmentCampaignId',
}: {
  queryKey?: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();
  const { options } = useAssignmentCampaignOptions();

  return (
    <Filter.View filterKey={queryKey}>
      <Command>
        <Command.Input placeholder="Search campaigns..." />
        <Command.Empty>No campaigns found</Command.Empty>
        <Command.List>
          {options.map((opt) => (
            <Command.Item
              key={opt.value}
              value={opt.value}
              onSelect={() => {
                setValue(opt.value);
                resetFilterState();
              }}
            >
              {opt.label}
              <Combobox.Check checked={value === opt.value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

export const SelectAssignmentCampaignFilterBar = () => {
  const [value, setValue] = useQueryState<string>('assignmentCampaignId');
  const [open, setOpen] = useState(false);
  const { options } = useAssignmentCampaignOptions();
  const selected = options.find((o) => o.value === value);

  return (
    <Filter.BarItem queryKey="assignmentCampaignId">
      <Filter.BarName>
        <IconTag />
        Campaign
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="assignmentCampaignId">
            <span>{selected?.label || 'Campaign'}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.Input placeholder="Search..." />
            <Command.List>
              {options.map((opt) => (
                <Command.Item
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    setValue(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                  <Combobox.Check checked={value === opt.value} />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const SelectAssignmentCampaignFormItem = ({
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { options, loading } = useAssignmentCampaignOptions();
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger
          className={cn('w-full shadow-xs', className)}
          disabled={loading}
        >
          <span className={selected ? '' : 'text-muted-foreground'}>
            {selected?.label || placeholder || 'Choose assignment campaign'}
          </span>
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search campaigns..." />
          <Command.Empty>No campaigns found</Command.Empty>
          <Command.List>
            {options.map((opt) => (
              <Command.Item
                key={opt.value}
                value={opt.value}
                onSelect={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                <Combobox.Check checked={value === opt.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
