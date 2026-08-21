import {
  IconCheck,
  IconProgressCheck,
  IconProgressX,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  useFilterContext,
  useMultiQueryState,
} from 'erxes-ui';

import { ILogStatusType } from '@/logs/types';

const LOG_STATUS_OPTIONS = [
  {
    value: ILogStatusType.SUCCESS,
    label: 'Success',
    icon: IconProgressCheck,
  },
  {
    value: ILogStatusType.FAILED,
    label: 'Failed',
    icon: IconProgressX,
  },
] as const;

export const LogStatusFilter = ({
  onValueChange,
}: {
  onValueChange?: () => void;
}) => {
  const [queries, setQueries] = useMultiQueryState<{
    status: string;
    statusOperator: string;
  }>(['status', 'statusOperator']);
  const { status } = queries;
  const { resetFilterState } = useFilterContext();

  return (
    <Command shouldFilter={false}>
      <Command.List className="p-1">
        <Combobox.Empty />
        {LOG_STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
          <Command.Item
            key={value}
            value={value}
            className="cursor-pointer"
            onSelect={() => {
              setQueries({
                status: value === status ? null : value,
                statusOperator: null,
              });
              resetFilterState();
              onValueChange?.();
            }}
          >
            <Icon />
            {label}
            {status === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
