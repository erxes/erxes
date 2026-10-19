import { IconWorld } from '@tabler/icons-react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  useFilterContext,
  useFilterQueryState,
} from 'erxes-ui';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SelectClientPortalContext,
  useSelectClientPortalContext,
} from '../contexts/SelectClientPortalContext';
import {
  useSelectClientPortalDetail,
  useSelectClientPortals,
} from '../hooks/useSelectClientPortals';

const DEFAULT_QUERY_KEY = 'clientPortalId';

export const SelectClientPortalProvider = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string | null;
  onValueChange: (value: string | null) => void;
}) => {
  const contextValue = useMemo(
    () => ({
      value: value || undefined,
      onSelect: (clientPortalId: string) =>
        onValueChange(clientPortalId === value ? null : clientPortalId),
    }),
    [value, onValueChange],
  );

  return (
    <SelectClientPortalContext.Provider value={contextValue}>
      {children}
    </SelectClientPortalContext.Provider>
  );
};

const SelectClientPortalValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useSelectClientPortalContext();
  const { clientPortals } = useSelectClientPortals();
  const cached = clientPortals.find((portal) => portal._id === value);
  const { clientPortal } = useSelectClientPortalDetail(value, !!cached);
  const selected = cached || clientPortal;

  if (!value) {
    return (
      <span className="text-accent-foreground/80">{placeholder ?? ''}</span>
    );
  }

  return <span className="truncate">{selected?.name || value}</span>;
};

const SelectClientPortalContent = () => {
  const { t } = useTranslation('common', { keyPrefix: 'filter' });
  const { value, onSelect } = useSelectClientPortalContext();
  const { clientPortals, loading, error } = useSelectClientPortals();

  return (
    <Command>
      <Command.Input
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder={t('search')}
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} error={error} />
        {clientPortals.map((portal) => (
          <Command.Item
            key={portal._id}
            value={`${portal.name ?? ''} ${portal._id}`}
            onSelect={() => onSelect(portal._id)}
          >
            <span className="truncate">{portal.name || portal._id}</span>
            <Combobox.Check checked={value === portal._id} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const SelectClientPortalLabel = () => {
  const { t } = useTranslation('contact');
  return <>{t('clientPortal')}</>;
};

export const SelectClientPortalFilterItem = ({
  queryKey = DEFAULT_QUERY_KEY,
}: {
  queryKey?: string;
}) => (
  <Filter.Item value={queryKey}>
    <IconWorld />
    <SelectClientPortalLabel />
  </Filter.Item>
);

export const SelectClientPortalFilterView = ({
  queryKey = DEFAULT_QUERY_KEY,
  onValueChange,
}: {
  queryKey?: string;
  onValueChange?: (value: string | null) => void;
}) => {
  const { resetFilterState, sessionKey } = useFilterContext();
  const [clientPortalId, setClientPortalId] = useFilterQueryState<string>(
    queryKey,
    sessionKey,
  );

  return (
    <Filter.View filterKey={queryKey}>
      <SelectClientPortalProvider
        value={clientPortalId}
        onValueChange={(value) => {
          setClientPortalId(value);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectClientPortalContent />
      </SelectClientPortalProvider>
    </Filter.View>
  );
};

export const SelectClientPortalFilterBar = ({
  queryKey = DEFAULT_QUERY_KEY,
  iconOnly,
  onValueChange,
}: {
  queryKey?: string;
  iconOnly?: boolean;
  onValueChange?: (value: string | null) => void;
}) => {
  const { sessionKey } = useFilterContext();
  const [clientPortalId, setClientPortalId] = useFilterQueryState<string>(
    queryKey,
    sessionKey,
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconWorld />
        {!iconOnly && <SelectClientPortalLabel />}
      </Filter.BarName>
      <SelectClientPortalProvider
        value={clientPortalId}
        onValueChange={(value) => {
          setClientPortalId(value);
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey}>
              <SelectClientPortalValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectClientPortalContent />
          </Combobox.Content>
        </Popover>
      </SelectClientPortalProvider>
    </Filter.BarItem>
  );
};

export const SelectClientPortalFormItem = ({
  value,
  onValueChange,
  className,
  placeholder,
}: {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectClientPortalProvider
      value={value}
      onValueChange={(next) => {
        onValueChange(next);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full h-8 font-medium', className)}>
            <SelectClientPortalValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectClientPortalContent />
        </Combobox.Content>
      </Popover>
    </SelectClientPortalProvider>
  );
};

export const SelectClientPortal = Object.assign(SelectClientPortalFormItem, {
  Provider: SelectClientPortalProvider,
  Value: SelectClientPortalValue,
  Content: SelectClientPortalContent,
  FilterItem: SelectClientPortalFilterItem,
  FilterView: SelectClientPortalFilterView,
  FilterBar: SelectClientPortalFilterBar,
  FormItem: SelectClientPortalFormItem,
});
