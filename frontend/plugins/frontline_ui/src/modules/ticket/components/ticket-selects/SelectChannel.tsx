import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { IChannel } from '@/channels/types';
import {
  Badge,
  Combobox,
  Command,
  Filter,
  IconComponent,
  PopoverScoped,
  TextOverflowTooltip,
  useFilterContext,
  useFilterQueryState,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';

interface SelectChannelContextType {
  value: string;
  onValueChange: (value: string) => void;
  loading: boolean;
  channels?: IChannel[];
}

const SelectChannelContext =
  React.createContext<SelectChannelContextType | null>(null);

const useSelectChannelContext = () => {
  const context = React.useContext(SelectChannelContext);
  if (!context) {
    throw new Error(
      'useSelectChannelContext must be used within SelectChannelProvider',
    );
  }
  return context;
};

const SelectChannelProvider = ({
  children,
  value,
  onValueChange,
  setOpen,
}: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  setOpen?: (open: boolean) => void;
}) => {
  const { channels, loading } = useGetChannels();

  const handleValueChange = (channelId: string) => {
    if (!channelId) return;
    onValueChange(channelId);
    setOpen?.(false);
  };

  return (
    <SelectChannelContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        loading,
        channels,
      }}
    >
      {children}
    </SelectChannelContext.Provider>
  );
};

const SelectChannelValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, channels } = useSelectChannelContext();

  if (!channels || channels.length === 0 || !value || !value.length) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select channels'}
      </span>
    );
  }

  const selectedChannels =
    channels?.filter((channel) => value.includes(channel._id)) || [];

  if (selectedChannels.length > 1) {
    return (
      <div className="flex gap-2 items-center">
        {selectedChannels.map((channel) => (
          <Badge key={channel._id} variant="secondary">
            <IconComponent
              name={channel.icon}
              className="size-4 flex-shrink-0"
            />
            <TextOverflowTooltip value={channel.name} className="max-w-32" />
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <IconComponent
        name={selectedChannels[0]?.icon}
        className="size-4 flex-shrink-0"
      />
      <TextOverflowTooltip
        value={selectedChannels[0]?.name}
        className="max-w-32"
      />
    </div>
  );
};

const SelectChannelCommandItem = ({ channel }: { channel: IChannel }) => {
  const { onValueChange, value } = useSelectChannelContext();

  return (
    <Command.Item
      value={channel._id}
      onSelect={() => {
        onValueChange(channel._id);
      }}
    >
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <IconComponent name={channel.icon} className="size-4" />
        <TextOverflowTooltip value={channel.name} />
      </div>
      <Combobox.Check checked={value.includes(channel._id)} />
    </Command.Item>
  );
};

const SelectChannelContent = () => {
  const { loading, channels } = useSelectChannelContext();
  return (
    <Command>
      <Command.Input placeholder="Search channels..." />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {channels?.map((channel) => (
          <SelectChannelCommandItem key={channel._id} channel={channel} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectChannelRoot = ({
  variant = 'detail',
  scope,
  id,
  value,
  onValueChange,
}: {
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  id: string;
  value: string;
  onValueChange?: (value: string) => void;
}) => {
  const { updateTicket } = useUpdateTicket();
  const [open, setOpen] = useState(false);
  const handleValueChange = (channelId: string) => {
    if (id) {
      updateTicket({
        variables: {
          _id: id,
          channelId,
        },
      });
    }
    onValueChange?.(channelId);
    setOpen(false);
  };
  return (
    <SelectChannelProvider
      value={value}
      onValueChange={handleValueChange}
      setOpen={setOpen}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant={variant}>
          <SelectChannelValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectChannelContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectChannelProvider>
  );
};

const SelectChannelFilterBar = ({ scope }: { scope?: string }) => {
  const [channel, setChannel] = useQueryState<string>('channel');
  const [open, setOpen] = useState(false);

  return (
    <SelectChannelProvider
      value={channel || ''}
      onValueChange={(value) => setChannel(value as string)}
      setOpen={setOpen}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="filter">
          <SelectChannelValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant="filter">
          <SelectChannelContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectChannelProvider>
  );
};

const SelectChannelFilterView = () => {
  const [channel, setChannel] = useFilterQueryState<string>('channel');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="channel">
      <SelectChannelProvider
        value={channel || ''}
        onValueChange={(value) => {
          setChannel(value as string);
          resetFilterState();
        }}
      >
        <SelectChannelContent />
      </SelectChannelProvider>
    </Filter.View>
  );
};

const SelectChannelFormItem = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectChannelProvider
      value={value}
      onValueChange={(value) => onValueChange(value as string)}
      setOpen={setOpen}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectChannelValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectChannelContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectChannelProvider>
  );
};

export const SelectChannel = Object.assign(SelectChannelRoot, {
  FilterBar: SelectChannelFilterBar,
  FilterView: SelectChannelFilterView,
  FormItem: SelectChannelFormItem,
});
