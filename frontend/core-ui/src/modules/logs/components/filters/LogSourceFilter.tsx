import {
  IconBrandGraphql,
  IconBrandMongodb,
  IconCheck,
  IconUserCheck,
  IconWebhook,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  useFilterContext,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const LogSourceFilter = ({
  onValueChange,
}: {
  onValueChange?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const [queries, setQueries] = useMultiQueryState<{
    source: string;
    sourceOperator: string;
    action: string;
    actionOperator: string;
  }>(['source', 'sourceOperator', 'action', 'actionOperator']);
  const { source } = queries;
  const { resetFilterState } = useFilterContext();

  return (
    <Command shouldFilter={false}>
      <Command.List className="p-1 ">
        <Combobox.Empty />
        {[
          {
            value: 'mongo',
            icon: IconBrandMongodb,
            label: 'MongoDb',
          },
          {
            value: 'graphql',
            icon: IconBrandGraphql,
            label: 'Graphql',
          },
          {
            value: 'auth',
            icon: IconUserCheck,
            label: t('source-authentication'),
          },
          {
            value: 'webhook',
            icon: IconWebhook,
            label: t('source-api-request'),
          },
        ].map(({ value, icon: Icon, label }) => (
          <Command.Item
            key={value}
            value={value}
            className="cursor-pointer"
            onSelect={() => {
              setQueries({
                source: value === source ? null : value,
                sourceOperator: null,
                action: null,
                actionOperator: null,
              });
              resetFilterState();
              onValueChange?.();
            }}
          >
            <Icon />
            {label}
            {source === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
