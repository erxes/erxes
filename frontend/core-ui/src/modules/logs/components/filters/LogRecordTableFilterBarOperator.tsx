import {
  Combobox,
  Command,
  Filter,
  Popover,
  useMultiQueryState,
} from 'erxes-ui';
import {
  LOG_FILTER_BAR_OPERATORS,
  COMMON_FILTER_BAR_OPERATORS,
} from '../../constants/logFilter';
import { IconCheck } from '@tabler/icons-react';
import { useSearchParams } from 'react-router';

const getFieldLableOperator = ({
  operator = 'eq',
  fields,
}: {
  operator?: string | null;
  fields: { value: string; label: string }[];
}) => {
  return fields.find(({ value }) => value === operator)?.label;
};

export const LogRecordTableFilterBarOperator = ({
  fieldName,
}: {
  fieldName: string;
}) => {
  const [searchParams] = useSearchParams();
  const [, setQueries] = useMultiQueryState<Record<string, string>>([
    `${fieldName}Operator`,
  ]);

  const operator = searchParams.get(`${fieldName}Operator`) || undefined;
  const fields =
    LOG_FILTER_BAR_OPERATORS[fieldName as keyof typeof LOG_FILTER_BAR_OPERATORS] ||
    COMMON_FILTER_BAR_OPERATORS;

  return (
    <Popover>
      <Popover.Trigger>
        <Filter.BarButton filterKey={`${fieldName}Operator`}>
          {getFieldLableOperator({
            fields,
            operator: operator,
          })}
        </Filter.BarButton>
      </Popover.Trigger>
      <Popover.Content>
        <Command shouldFilter={false} onSelect={(e) => e.currentTarget}>
          <Command.List className="p-1 ">
            <Combobox.Empty />
            {fields.map(({ value, label }) => (
              <Command.Item
                key={value}
                value={value}
                className={`cursor-pointer`}
                onSelect={() =>
                  setQueries({
                    [`${fieldName}Operator`]: value === operator ? '' : value,
                  })
                }
              >
                {label}
                {operator === value && <IconCheck className="ml-auto" />}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
