import React, { useEffect, useState } from 'react';
import {
  cn,
  ColorPicker,
  Combobox,
  Command,
  Filter,
  Form,
  Input,
  PopoverScoped,
  Select,
  useQueryState,
  useFilterContext,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useAddTicketStatus } from '@/status/hooks/useAddTicketStatus';
import { useGetAccessibleTicketStatuses } from '@/status/hooks/useGetTicketStatus';
import { ITicketStatusChoice } from '@/status/types';
import {
  TICKET_DEFAULT_STATUSES,
  TICKET_STATUS_TYPE_NAMES,
  TICKET_STATUS_TYPES,
} from '@/status/constants';
import { StatusInlineIcon } from '@/status/components/StatusInline';
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
import { TICKET_STATUS_FORM_SCHEMA } from '@/settings/schema/ticketStatus';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Control,
  FieldValues,
  UseFormReturn,
  useForm,
  useWatch,
} from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { canMoveTicketToStatus } from '@/ticket/hooks/useTicketPermissions';
import { z } from 'zod';

const INLINE_STATUS_SCHEMA = TICKET_STATUS_FORM_SCHEMA.extend({
  name: z.string().trim().min(1),
  type: z.number(),
});

type TInlineStatusForm = z.infer<typeof INLINE_STATUS_SCHEMA>;

const getDefaultStatusColor = (type: number) =>
  TICKET_DEFAULT_STATUSES.find((status) => status.type === type)?.color ||
  '#000000';

interface SelectStatusContextType {
  value: string;
  onValueChange: (status: string) => void;
  loading?: boolean;
  error?: any;
  statuses?: ITicketStatusChoice[];
  pipelineId?: string;
  restrictToMovable?: boolean;
  refetch: () => void;
}

const SelectStatusContext = React.createContext<SelectStatusContextType | null>(
  null,
);

const useSelectStatusContext = () => {
  const context = React.useContext(SelectStatusContext);
  if (!context) {
    throw new Error(
      'useSelectStatusContext must be used within SelectStatusProvider',
    );
  }
  return context;
};

export const SelectStatusProvider = ({
  value,
  onValueChange,
  pipelineId,
  restrictToMovable,
  children,
}: {
  value: string;
  onValueChange: (status: string) => void;
  children: React.ReactNode;
  pipelineId?: string;
  restrictToMovable?: boolean;
}) => {
  const handleValueChange = (status: string) => {
    if (!status) return;
    onValueChange?.(status);
  };
  const { statuses, loading, error, refetch } = useGetAccessibleTicketStatuses({
    variables: { pipelineId },
    skip: !pipelineId,
  });
  return (
    <SelectStatusContext.Provider
      value={{
        value: value || '',
        onValueChange: handleValueChange,
        statuses,
        loading,
        error,
        pipelineId,
        restrictToMovable,
        refetch,
      }}
    >
      {children}
    </SelectStatusContext.Provider>
  );
};

const SelectStatusValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { value, statuses } = useSelectStatusContext();
  const selectedStatus = statuses?.find((status) => status.value === value);

  if (!selectedStatus) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || t('select-status', 'Select status')}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StatusInlineIcon
        statusType={selectedStatus.type}
        color={selectedStatus.color}
      />
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedStatus.label}
      </p>
    </div>
  );
};

const SelectStatusCommandItem = ({
  status,
}: {
  status: ITicketStatusChoice;
}) => {
  const { t } = useTranslation('frontline');
  const { onValueChange, value, restrictToMovable } = useSelectStatusContext();
  const currentUser = useAtomValue(currentUserState);
  const { label, value: statusValue, type, color } = status || {};

  const canMove = canMoveTicketToStatus(status, currentUser?._id);
  const isBlocked = !!restrictToMovable && !canMove && value !== statusValue;

  return (
    <Command.Item
      value={statusValue}
      keywords={[label]}
      disabled={isBlocked}
      onSelect={() => {
        if (isBlocked) return;
        onValueChange(statusValue);
      }}
    >
      <div className="flex items-center gap-2 flex-1">
        <StatusInlineIcon statusType={type} color={color} />
        <span className="font-medium capitalize">{label}</span>
        {isBlocked && (
          <span className="text-xs text-muted-foreground">
            {t('no-move-permission-short', 'No move permission')}
          </span>
        )}
      </div>
      <Combobox.Check checked={value === statusValue} />
    </Command.Item>
  );
};

const SelectStatusCreateForm = ({
  name,
  pipelineId,
  onBack,
}: {
  name: string;
  pipelineId: string;
  onBack: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { onValueChange, refetch } = useSelectStatusContext();
  const { addStatus, loading } = useAddTicketStatus();
  const form = useForm<TInlineStatusForm>({
    resolver: zodResolver(INLINE_STATUS_SCHEMA),
    defaultValues: {
      name,
      description: '',
      type: TICKET_STATUS_TYPES.OPEN,
      color: getDefaultStatusColor(TICKET_STATUS_TYPES.OPEN),
    },
  });
  const statusType = form.watch('type');

  const onSubmit = ({ name, color, type }: TInlineStatusForm) => {
    addStatus({
      variables: { name, color, type, pipelineId },
      onCompleted: ({ addTicketStatus }) => {
        refetch();
        onBack();
        onValueChange(addTicketStatus._id);
      },
    });
  };

  return (
    <Form {...form}>
      <SelectCreateContainer
        title={t('create-status', 'Create status')}
        onBack={onBack}
        onSubmit={form.handleSubmit(onSubmit)}
        loading={loading}
      >
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('name', 'Name')}</Form.Label>
              <div className="flex items-center gap-2">
                <Form.Field
                  control={form.control}
                  name="color"
                  render={({ field: colorField }) => (
                    <ColorPicker.Provider
                      value={colorField.value || '#000000'}
                      onValueChange={colorField.onChange}
                    >
                      <ColorPicker.Trigger
                        aria-label={t('color', 'Color')}
                        className="size-8 flex-none justify-center p-0"
                        style={{
                          backgroundColor: `${colorField.value || '#000000'}25`,
                        }}
                      >
                        <StatusInlineIcon
                          color={colorField.value}
                          statusType={statusType}
                        />
                      </ColorPicker.Trigger>
                      <ColorPicker.Content />
                    </ColorPicker.Provider>
                  )}
                />
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
              </div>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="type"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('type', 'Type')}</Form.Label>
              <Select
                value={String(field.value)}
                onValueChange={(value) => {
                  const type = Number(value);
                  field.onChange(type);
                  form.setValue('color', getDefaultStatusColor(type));
                }}
              >
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(TICKET_STATUS_TYPES).map((type) => (
                    <Select.Item key={type} value={String(type)}>
                      <span className="capitalize">
                        {t(TICKET_STATUS_TYPE_NAMES[type])}
                      </span>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
      </SelectCreateContainer>
    </Form>
  );
};

const SelectStatusContent = ({ allowCreate }: { allowCreate?: boolean }) => {
  const { t } = useTranslation('frontline');
  const { statuses, pipelineId, loading } = useSelectStatusContext();
  const [search, setSearch] = useState('');
  const [newStatusName, setNewStatusName] = useState('');

  if (newStatusName && pipelineId) {
    return (
      <SelectStatusCreateForm
        name={newStatusName}
        pipelineId={pipelineId}
        onBack={() => setNewStatusName('')}
      />
    );
  }

  const showCreate =
    allowCreate &&
    Boolean(pipelineId) &&
    !loading &&
    canCreateFromSearch(
      search,
      (statuses || []).map((status) => status.label),
    );

  return (
    <Command>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={t('search-status', 'Search status')}
      />
      {!showCreate && (
        <Command.Empty>
          <span className="text-muted-foreground">
            {pipelineId
              ? t('no-status-found', 'No status found')
              : t('pipeline-not-selected', 'Pipeline not selected')}
          </span>
        </Command.Empty>
      )}
      <Command.List>
        {statuses?.map((status) => (
          <SelectStatusCommandItem key={status.value} status={status} />
        ))}
        {showCreate && (
          <SelectCreateCommandItem
            search={search}
            label={t('create-new-status', 'Create new status')}
            onSelect={setNewStatusName}
          />
        )}
      </Command.List>
    </Command>
  );
};

const SelectStatusTicketRoot = ({
  value,
  id,
  pipelineId,
  variant,
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  id: string;
  pipelineId: string;
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTicket } = useUpdateTicket();
  const handleValueChange = (value: string) => {
    if (id) {
      updateTicket({
        variables: {
          _id: id,
          statusId: value,
        },
      });
      onValueChange?.(value);
    }
    setOpen(false);
  };

  return (
    <SelectStatusProvider
      pipelineId={pipelineId}
      value={value}
      onValueChange={handleValueChange}
      restrictToMovable
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerTicket variant={variant} disabled={disabled}>
          <SelectStatusValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectStatusContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTicketFilterView = ({
  pipelineId,
}: {
  pipelineId?: string;
}) => {
  const [status, setStatus] = useQueryState<string>('statusId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="statusId">
      <SelectStatusProvider
        value={status || ''}
        pipelineId={pipelineId}
        onValueChange={(value) => {
          setStatus(value as string);
          resetFilterState();
        }}
      >
        <SelectStatusContent />
      </SelectStatusProvider>
    </Filter.View>
  );
};

export const SelectStatusTicketFilterBar = ({
  pipelineId,
  scope,
}: {
  pipelineId?: string;
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [status, setStatus] = useQueryState<string>('statusId');
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusProvider
      pipelineId={pipelineId}
      value={status || ''}
      onValueChange={(value) => {
        setStatus(value);
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <Filter.BarButton filterKey="statusId">
          <SelectStatusValue placeholder={t('status', 'Status')} />
        </Filter.BarButton>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTicketFormItem = <TFieldValues extends FieldValues>({
  value,
  onValueChange,
  form,
}: {
  value: string;
  onValueChange: (value: string) => void;
  form?: UseFormReturn<TFieldValues>;
}) => {
  // The caller must hand over its own control: this remote and `erxes-ui` hold
  // separate react-hook-form instances, so `useFormContext` here cannot see the
  // provider `erxes-ui`'s `Form` renders. The cast is the react-hook-form
  // generic boundary — `Control<T>` is invariant across schemas.
  const control = form?.control as Control<FieldValues> | undefined;
  const pipelineId: string | undefined = useWatch({
    name: 'pipelineId',
    control,
  });
  const { statuses } = useGetAccessibleTicketStatuses({
    variables: { pipelineId },
    skip: !pipelineId,
  });

  const [open, setOpen] = useState(false);

  const fallBackStatus = statuses?.find(
    (status) => status.type === TICKET_STATUS_TYPES.NEW,
  )?.value;

  useEffect(() => {
    if (fallBackStatus && !value) {
      onValueChange(fallBackStatus);
    }
  }, [fallBackStatus, value, onValueChange]);

  return (
    <SelectStatusProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value);
        setOpen(false);
      }}
      pipelineId={pipelineId || undefined}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectStatusValue />
        </SelectTriggerTicket>
        <Combobox.Content>
          <SelectStatusContent allowCreate />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTicket = Object.assign(SelectStatusTicketRoot, {
  Provider: SelectStatusProvider,
  Value: SelectStatusValue,
  Content: SelectStatusContent,
  FilterView: SelectStatusTicketFilterView,
  FilterBar: SelectStatusTicketFilterBar,
  FormItem: SelectStatusTicketFormItem,
});
