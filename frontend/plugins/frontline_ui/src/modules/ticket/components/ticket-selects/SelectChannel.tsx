import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import {
  canCreateFromSearch,
  SelectCreateCommandItem,
  SelectCreateContainer,
} from '@/ticket/components/ticket-selects/SelectCreate';
import { ChannelForm } from '@/channels/components/settings/channels-list/ChannelForm';
import { useChannelAdd } from '@/channels/hooks/useChannelAdd';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { CHANNEL_SCHEMA } from '@/channels/schema/channel';
import { IChannel, TChannelForm } from '@/channels/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Combobox,
  Command,
  Filter,
  Form,
  IconComponent,
  PopoverScoped,
  TextOverflowTooltip,
  useFilterContext,
  useFilterQueryState,
  useQueryState,
  useToast,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const INLINE_CHANNEL_SCHEMA = CHANNEL_SCHEMA.extend({
  name: z.string().trim().min(1),
});

interface SelectChannelContextType {
  value: string;
  onValueChange: (value: string) => void;
  loading: boolean;
  channels?: IChannel[];
  refetch: () => void;
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
  onValueChange?: (value: string) => void;
  setOpen?: (open: boolean) => void;
}) => {
  const { channels, loading, refetch } = useGetChannels();

  const handleValueChange = (channelId: string) => {
    if (!channelId) return;
    onValueChange?.(channelId);
    setOpen?.(false);
  };

  return (
    <SelectChannelContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        loading,
        channels,
        refetch,
      }}
    >
      {children}
    </SelectChannelContext.Provider>
  );
};

const SelectChannelValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, channels } = useSelectChannelContext();

  if (!channels || channels?.length === 0 || !value?.length) {
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
            <IconComponent name={channel.icon} className="size-4 shrink-0" />
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
        className="size-4 shrink-0"
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
      keywords={[channel.name]}
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

const SelectChannelCreateForm = ({
  name,
  onBack,
}: {
  name: string;
  onBack: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { onValueChange, refetch } = useSelectChannelContext();
  const { addChannel, loading } = useChannelAdd();
  const form = useForm<TChannelForm>({
    resolver: zodResolver(INLINE_CHANNEL_SCHEMA),
    defaultValues: {
      name,
      description: '',
      memberIds: [],
      scope: 'team',
    },
  });

  const onSubmit = (data: TChannelForm) => {
    addChannel({
      variables: data,
      onCompleted: ({ channelAdd }) => {
        toast({ title: t('success', 'Success!') });
        refetch();
        onBack();
        onValueChange(channelAdd._id);
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <Form {...form}>
      <SelectCreateContainer
        title={t('create-channel', 'Create channel')}
        onBack={onBack}
        onSubmit={form.handleSubmit(onSubmit)}
        loading={loading}
      >
        <ChannelForm form={form} />
      </SelectCreateContainer>
    </Form>
  );
};

const SelectChannelContent = ({ allowCreate }: { allowCreate?: boolean }) => {
  const { t } = useTranslation('frontline');
  const { loading, channels } = useSelectChannelContext();
  const [search, setSearch] = useState('');
  const [newChannelName, setNewChannelName] = useState('');

  if (newChannelName) {
    return (
      <SelectChannelCreateForm
        name={newChannelName}
        onBack={() => setNewChannelName('')}
      />
    );
  }

  const showCreate =
    allowCreate &&
    !loading &&
    canCreateFromSearch(
      search,
      (channels || []).map((channel) => channel.name),
    );

  return (
    <Command>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={t('search-channels', 'Search channels...')}
      />
      <Command.List>
        {!showCreate && <Combobox.Empty loading={loading} />}
        {channels?.map((channel) => (
          <SelectChannelCommandItem key={channel._id} channel={channel} />
        ))}
        {showCreate && (
          <SelectCreateCommandItem
            search={search}
            label={t('create-new-channel', 'Create new channel')}
            onSelect={setNewChannelName}
          />
        )}
      </Command.List>
    </Command>
  );
};

const SelectChannelRoot = ({
  variant = 'detail',
  disabled,
  scope,
  value,
  onValueChange,
}: {
  variant?: `${SelectTriggerVariant}`;
  disabled?: boolean;
  scope?: string;
  value: string;
  onValueChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectChannelProvider
      value={value}
      onValueChange={onValueChange}
      setOpen={setOpen}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant={variant} disabled={disabled}>
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
          <SelectChannelContent allowCreate />
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
