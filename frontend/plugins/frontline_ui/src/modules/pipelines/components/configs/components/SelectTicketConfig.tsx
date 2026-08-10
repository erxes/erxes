import { ApolloError } from '@apollo/client';
import {
  Badge,
  cn,
  Combobox,
  Command,
  Form,
  PopoverScoped,
  Tooltip,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IConfig, useGetTicketConfigs } from '../hooks/useGetTicketConfigs';

interface SelectTicketConfigContextType {
  value: string[];
  onValueChange: (configIds: string[]) => void;
  loading?: boolean;
  error?: ApolloError;
  configs?: IConfig[];
  channelId?: string;
}

const MAX_VISIBLE_CONFIG_NAMES = 3;

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
  value?: string[] | null;
  onValueChange: (configIds: string[]) => void;
  children: React.ReactNode;
  channelId?: string;
}) => {
  const { id: routeChannelId } = useParams<{ id: string }>();
  const effectiveChannelId = channelId || routeChannelId;

  const { ticketConfigs, loading, error } = useGetTicketConfigs({
    variables: { channelId: effectiveChannelId as string },
    skip: !effectiveChannelId,
  });

  return (
    <SelectTicketConfigContext.Provider
      value={{
        value: value || [],
        onValueChange,
        configs: ticketConfigs,
        loading,
        error,
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
  const { t } = useTranslation('frontline');
  const { value, configs } = useSelectTicketConfigContext();
  const selectedConfigs = (configs || []).filter((config) =>
    value.includes(config.id),
  );

  if (value.length === 0) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || t('search-config')}
      </span>
    );
  }

  if (value.length === 1 && selectedConfigs.length === 1) {
    return (
      <div className="flex items-center gap-1 overflow-hidden">
        <p
          className={cn(
            'font-medium truncate',
            value.length > 1 ? 'text-xs' : 'text-sm',
            className,
          )}
        >
          {selectedConfigs[0].name}
        </p>
      </div>
    );
  }

  if (
    selectedConfigs.length === value.length &&
    value.length <= MAX_VISIBLE_CONFIG_NAMES
  ) {
    return (
      <div className="flex items-center gap-1 overflow-hidden">
        {selectedConfigs.map((config) => (
          <Badge
            key={config.id}
            className={cn(
              'font-medium truncate',
              value.length > 1 ? 'text-xs' : 'text-sm',
              className,
            )}
          >
            {config.name}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Tooltip>
      <Tooltip.Provider>
        <Tooltip.Trigger>
          <Badge className={cn('font-medium text-sm', className)}>
            {t('n-selected', { count: value.length })}
          </Badge>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {selectedConfigs.map((config) => config.name).join(', ')}
        </Tooltip.Content>
      </Tooltip.Provider>
    </Tooltip>
  );
};

const SelectTicketConfigCommandItem = ({ config }: { config: IConfig }) => {
  const { onValueChange, value } = useSelectTicketConfigContext();
  const { name, id } = config || {};
  const isSelected = value.includes(id);

  return (
    <Command.Item
      value={id}
      keywords={[name]}
      onSelect={() => {
        onValueChange(
          isSelected
            ? value.filter((configId) => configId !== id)
            : [...value, id],
        );
      }}
    >
      <div className="flex items-center gap-2 flex-1">
        <span className="font-medium">{name}</span>
      </div>
      <Combobox.Check checked={isSelected} />
    </Command.Item>
  );
};

const SelectTicketConfigContent = () => {
  const { t } = useTranslation('frontline');
  const { configs, channelId, loading, error } = useSelectTicketConfigContext();
  return (
    <Command>
      <Command.Input placeholder={t('search-config')} />
      <Command.List>
        {loading || error ? (
          <Combobox.Empty loading={loading} error={error} />
        ) : (
          <Command.Empty>
            <span className="text-muted-foreground">
              {channelId ? t('no-config-found') : t('channel-not-selected')}
            </span>
          </Command.Empty>
        )}
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
  value?: string[] | null;
  channelId: string;
  scope?: string;
  onValueChange: (configIds: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectTicketConfigProvider
      channelId={channelId}
      value={value}
      onValueChange={onValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Form.Control>
          <Combobox.TriggerBase className="w-full h-8 font-medium">
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
  value?: string[] | null;
  onValueChange: (configIds: string[]) => void;
  channelId?: string;
}) => {
  const { id: routeChannelId } = useParams<{ id: string }>();
  const effectiveChannelId = channelId || routeChannelId;
  const [open, setOpen] = useState(false);

  return (
    <SelectTicketConfigProvider
      value={value}
      onValueChange={onValueChange}
      channelId={effectiveChannelId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.TriggerBase className="w-full h-8 font-medium">
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
