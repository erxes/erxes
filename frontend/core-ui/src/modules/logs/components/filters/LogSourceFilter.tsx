import {
  IconBrandGraphql,
  IconBrandMongodb,
  IconCheck,
  IconUserCheck,
  IconWebhook,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Combobox, Command, useMultiQueryState } from 'erxes-ui';

export const LogSourceFilter = () => {
  const { t } = useTranslation('common');
  const [queries, setQueries] = useMultiQueryState<{
    source: string;
    sourceOperator: string;
    action: string;
    actionOperator: string;
  }>(['source', 'sourceOperator', 'action', 'actionOperator']);
  const { source } = queries;

  return (
    <Command shouldFilter={false}>
      <Command.List className="p-1 ">
        <Combobox.Empty />
        {[
          {
            value: 'mongo',
            icon: IconBrandMongodb,
            label: t('logs.source-mongodb', 'MongoDb'),
          },
          {
            value: 'graphql',
            icon: IconBrandGraphql,
            label: t('logs.source-graphql', 'Graphql'),
          },
          {
            value: 'auth',
            icon: IconUserCheck,
            label: t('logs.source-auth', 'Authentication'),
          },
          {
            value: 'webhook',
            icon: IconWebhook,
            label: t('logs.source-api-request', 'Api Request'),
          },
        ].map(({ value, icon: Icon, label }) => (
          <Command.Item
            key={value}
            value={value}
            className="cursor-pointer"
            onSelect={() =>
              setQueries({
                source: value === source ? null : value,
                sourceOperator: null,
                action: null,
                actionOperator: null,
              })
            }
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
