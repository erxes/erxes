import React, { useState } from 'react';
import { cn, Combobox, Command, Form, PopoverScoped } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useGetTicketConfigs, IConfig } from '../hooks/useGetTicketConfigs';

interface SelectTicketConfigContextType {
  value: string;
  onValueChange: (configId: string) => void;
  loading?: boolean;
  error?: any;
  configs?: IConfig[];
  channelId?: string;
}

const SelectTicketConfigContext =
  React.createContext<SelectTicketConfigContextType | null>(null);

const useSelectTicketConfigContext = () => {
  const context = React.useContext(SelectTicketConfigContext);
  if (!context) {
    throw new Error(
      'useSelectTicketConfigContext must be used within SelectTicketConfigProvider',
    );
  }
  return context;
};

export const SelectTicketConfigProvider = ({
  value,
  onValueChange,
  channelId,
  children,
}: {
  value: string;
  onValueChange: (configId: string) => void;
  children: React.ReactNode;
  channelId?: string;
}) => {
  const { id: routeChannelId } = useParams<{ id: string }>();
  const effectiveChannelId = channelId || routeChannelId;

  const handleValueChange = (configId: string) => {
    if (!configId) return;
    onValueChange?.(configId);
  };
  const { ticketConfigs, loading } = useGetTicketConfigs({
    variables: { channelId: effectiveChannelId as string },
    skip: !effectiveChannelId,
  });
  return (
    <SelectTicketConfigContext.Provider
      value={{
        value: value || '',
        onValueChange: handleValueChange,
        configs: ticketConfigs,
        loading,
        channelId: effectiveChannelId,
      }}
    >
      {children}
    </SelectTicketConfigContext.Provider>
  );
};

const SelectTicketConfigValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, configs } = useSelectTicketConfigContext();
  const selectedConfig = configs?.find((config) => config.id === value);

  if (!selectedConfig) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select config'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedConfig.name}
      </p>
    </div>
  );
};

const SelectTicketConfigCommandItem = ({ config }: { config: IConfig }) => {
  const { onValueChange, value } = useSelectTicketConfigContext();
  const { name, id } = config || {};

  return (
    <Command.Item
      value={id}
      onSelect={() => {
        onValueChange(id);
      }}
    >
      <div className="flex items-center gap-2 flex-1">
        <span className="font-medium">{name}</span>
      </div>
      <Combobox.Check checked={value === id} />
    </Command.Item>
  );
};

const SelectTicketConfigContent = () => {
  const { configs, channelId } = useSelectTicketConfigContext();
  return (
    <Command>
      <Command.Input placeholder="Search config" />
      <Command.Empty>
        <span className="text-muted-foreground">
          {channelId ? 'No config found' : 'Channel not selected'}
        </span>
      </Command.Empty>
      <Command.List>
        {configs?.map((config) => (
          <SelectTicketConfigCommandItem key={config.id} config={config} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectTicketConfigRoot = ({
  value,
  channelId,
  scope,
  onValueChange,
}: {
  value: string;
  channelId: string;
  scope?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: string) => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <SelectTicketConfigProvider
      channelId={channelId}
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Form.Control>
          <Combobox.TriggerBase className="w-full h-7 font-medium max-w-64">
            <SelectTicketConfigValue />
          </Combobox.TriggerBase>
        </Form.Control>
        <Combobox.Content>
          <SelectTicketConfigContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectTicketConfigProvider>
  );
};

export const SelectTicketConfigFormItem = ({
  value,
  onValueChange,
  channelId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  channelId?: string;
}) => {
  const { id: routeChannelId } = useParams<{ id: string }>();
  const effectiveChannelId = channelId || routeChannelId;
  const [open, setOpen] = useState(false);

  return (
    <SelectTicketConfigProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value);
        setOpen(false);
      }}
      channelId={effectiveChannelId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.TriggerBase className="w-full h-7 font-medium max-w-64">
            <SelectTicketConfigValue />
          </Combobox.TriggerBase>
        </Form.Control>
        <Combobox.Content>
          <SelectTicketConfigContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectTicketConfigProvider>
  );
};

export const SelectTicketConfig = Object.assign(SelectTicketConfigRoot, {
  Provider: SelectTicketConfigProvider,
  Value: SelectTicketConfigValue,
  Content: SelectTicketConfigContent,
  FormItem: SelectTicketConfigFormItem,
});
