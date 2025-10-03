import {
  IconCheck,
  IconProgressCheck,
  IconProgressX,
} from '@tabler/icons-react';
import { Command, Combobox, useQueryState } from 'erxes-ui';

export const LogStatusFilter = () => {
  const [status, setStatus] = useQueryState<string>('status');

  return (
    <Command shouldFilter={false}>
      <Command.List className="p-1 ">
        <Combobox.Empty />
        {[
          {
            value: 'success',
            className:
              'bg-success/10 data-[selected=true]:bg-success/20 text-success border-success/10',
            icon: IconProgressCheck,
            label: 'Success',
          },
          {
            value: 'failed',
            className:
              'mt-2 bg-destructive/10 data-[selected=true]:bg-destructive/20 text-destructive border-destructive/10',
            icon: IconProgressX,
            label: 'Failed',
          },
        ].map(({ value, className, icon: Icon, label }) => (
          <Command.Item
            key={value}
            value={value}
            className={`cursor-pointer ${className}`}
            onSelect={() => setStatus(value === status ? '' : value)}
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
