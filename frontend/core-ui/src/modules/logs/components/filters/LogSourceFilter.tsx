import {
  IconBrandGraphql,
  IconBrandMongodb,
  IconCheck,
  IconUserCheck,
  IconWebhook,
} from '@tabler/icons-react';
import { Combobox, Command, useQueryState } from 'erxes-ui';

export const LogSourceFilter = () => {
  const [source, setSource] = useQueryState<string>('source');

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
            label: 'Authentication',
          },
          {
            value: 'webhook',
            icon: IconWebhook,
            label: 'Api Request',
          },
        ].map(({ value, icon: Icon, label }) => (
          <Command.Item
            key={value}
            value={value}
            className="cursor-pointer"
            onSelect={() => setSource(value === source ? '' : value)}
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
