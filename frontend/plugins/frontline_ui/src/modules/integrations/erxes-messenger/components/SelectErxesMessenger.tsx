import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  Combobox,
  Command,
  EnumCursorDirection,
  Popover,
  Skeleton,
} from 'erxes-ui';
import { useIntegrations } from '@/integrations/hooks/useIntegrations';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { IIntegration } from '@/integrations/types/Integration';
import { REACT_APP_WIDGETS_URL } from '@/utils';

const MESSENGER_KIND = 'messenger';

export const getMessengerWidgetBundleUrl = () =>
  `${REACT_APP_WIDGETS_URL}/messengerBundle.js`;

export interface IEMSelectValue {
  integrationId: string;
  widgetBundleUrl: string;
}

export interface SelectEMProps {
  value?: string;
  onValueChange: (value: IEMSelectValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const SelectEMValue = ({
  integrationId,
  placeholder,
}: {
  integrationId?: string;
  placeholder?: string;
}) => {
  const { integrationDetail, loading } = useIntegrationDetail({
    integrationId: integrationId || null,
  });

  if (!integrationId) {
    return (
      <span className="text-muted-foreground">
        {placeholder || 'Select erxes messenger integration'}
      </span>
    );
  }

  if (loading) {
    return <Skeleton className="w-24 h-4" />;
  }

  return <span>{integrationDetail?.name || integrationId}</span>;
};

export const SelectErxesMessenger = ({
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
}: SelectEMProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const {
    integrations = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useIntegrations({
    variables: {
      kind: MESSENGER_KIND,
      channelId: '',
      searchValue: debouncedSearch,
      limit: 20,
    },
  });

  const handleSelect = (integration: IIntegration) => {
    onValueChange({
      integrationId: integration._id,
      widgetBundleUrl: getMessengerWidgetBundleUrl(),
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className={className} disabled={disabled}>
        <SelectEMValue integrationId={value} placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search erxes messenger integrations..."
          />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {integrations.map((integration: IIntegration) => (
              <Command.Item
                key={integration._id}
                value={integration._id}
                onSelect={() => handleSelect(integration)}
              >
                {integration.name}
                <Combobox.Check checked={integration._id === value} />
              </Command.Item>
            ))}
            <Combobox.FetchMore
              fetchMore={() =>
                handleFetchMore({ direction: EnumCursorDirection.FORWARD })
              }
              totalCount={totalCount}
              currentLength={integrations.length}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export default SelectErxesMessenger;
