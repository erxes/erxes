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
import { useTranslation } from 'react-i18next';

const LOG_STATUS_OPTIONS = [
  {
    value: ILogStatusType.SUCCESS,
    labelKey: 'status-success',
    icon: IconProgressCheck,
  },
  {
    value: ILogStatusType.FAILED,
    labelKey: 'status-failed',
    icon: IconProgressX,
  },
] as const;

export const LogStatusFilter = ({
  onValueChange,
}: {
  onValueChange?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
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
        {LOG_STATUS_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
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
            {t(labelKey)}
            {status === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
