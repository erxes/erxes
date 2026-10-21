import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import {
  SelectCreateCommandItem,
  SelectCreateContainer,
  useSelectCreate,
} from '@/ticket/components/ticket-selects/SelectCreate';
import { CreatePipelineForm } from '@/pipelines/components/CreatePipelineForm';
import { usePipelineAdd } from '@/pipelines/hooks/useAddPipeline';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { IPipeline, TCreatePipelineForm } from '@/pipelines/types';
import { CREATE_PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Filter,
  Form,
  PopoverScoped,
  TextOverflowTooltip,
  useFilterContext,
  useFilterQueryState,
  useQueryState,
  useToast,
} from 'erxes-ui';
import React, { useEffect, useState } from 'react';
import {
  Control,
  FieldValues,
  UseFormReturn,
  useForm,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { addTicketSchema } from '@/ticket/types';
import { z } from 'zod';
import type { ApolloError } from '@apollo/client';
import { Link } from 'react-router';

const INLINE_PIPELINE_SCHEMA = CREATE_PIPELINE_FORM_SCHEMA.extend({
  name: z.string().trim().min(1),
});

interface SelectPipelineContextType {
  value: string;
  onValueChange: (value: string) => void;
  loading: boolean;
  error?: ApolloError;
  pipelines?: IPipeline[];
  channelId?: string;
}

const SelectPipelineContext =
  React.createContext<SelectPipelineContextType | null>(null);

const useSelectPipelineContext = () => {
  const context = React.useContext(SelectPipelineContext);
  if (!context) {
    throw new Error(
      'useSelectPipelineContext must be used within SelectPipelineProvider',
    );
  }
  return context;
};

const SelectPipelineProvider = ({
  children,
  value,
  onValueChange,
  setOpen,
  channelId,
}: {
  children: React.ReactNode;
  value: string;
  onValueChange?: (value: string) => void;
  setOpen?: (open: boolean) => void;
  channelId?: string;
}) => {
  const { pipelines, loading, error } = useGetPipelines({
    variables: {
      filter: {
        channelId,
        applyVisibilityFilter: true,
      },
    },
    skip: !channelId,
  });

  const handleValueChange = (pipelineId: string) => {
    if (!pipelineId) return;
    onValueChange?.(pipelineId);
    setOpen?.(false);
  };

  return (
    <SelectPipelineContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        loading,
        error,
        pipelines,
        channelId,
      }}
    >
      {children}
    </SelectPipelineContext.Provider>
  );
};

const SelectPipelineValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, pipelines } = useSelectPipelineContext();
  if (!pipelines || pipelines.length === 0 || !value) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select pipeline'}
      </span>
    );
  }

  const selectedPipelines =
    pipelines?.filter((pipeline) => value.includes(pipeline._id)) || [];

  if (selectedPipelines.length > 1) {
    return (
      <div className="flex gap-2 items-center">
        {selectedPipelines.map((pipeline) => (
          <Badge key={pipeline._id} variant="secondary">
            <TextOverflowTooltip value={pipeline.name} className="max-w-32" />
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <TextOverflowTooltip
        value={selectedPipelines[0]?.name}
        className="max-w-32"
      />
    </div>
  );
};

const SelectPipelineCommandItem = ({ pipeline }: { pipeline: IPipeline }) => {
  const { onValueChange, value } = useSelectPipelineContext();

  return (
    <Command.Item
      value={pipeline._id}
      keywords={[pipeline.name]}
      onSelect={() => {
        onValueChange(pipeline._id);
      }}
    >
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <TextOverflowTooltip value={pipeline.name} />
      </div>
      <Combobox.Check checked={value.includes(pipeline._id)} />
    </Command.Item>
  );
};

const SelectPipelineCreateForm = ({
  name,
  channelId,
  onBack,
}: {
  name: string;
  channelId: string;
  onBack: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { onValueChange } = useSelectPipelineContext();
  const { addPipeline, loading } = usePipelineAdd();
  const form = useForm<TCreatePipelineForm>({
    resolver: zodResolver(INLINE_PIPELINE_SCHEMA),
    defaultValues: {
      name,
      description: '',
      channelId,
    },
  });

  const onSubmit = (data: TCreatePipelineForm) => {
    addPipeline({
      variables: { ...data, channelId },
      awaitRefetchQueries: true,
      onCompleted: ({ createPipeline }) => {
        toast({ title: t('success', 'Success!'), variant: 'success' });
        onBack();
        if (createPipeline) onValueChange(createPipeline._id);
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
        title={t('create-pipeline', 'Create pipeline')}
        onBack={onBack}
        onSubmit={form.handleSubmit(onSubmit)}
        loading={loading}
      >
        <CreatePipelineForm form={form} />
      </SelectCreateContainer>
    </Form>
  );
};

const SelectPipelineContent = ({ allowCreate }: { allowCreate?: boolean }) => {
  const { t } = useTranslation('frontline');
  const { pipelines, channelId, loading, error } = useSelectPipelineContext();
  const { search, setSearch, newName, setNewName, showCreate } =
    useSelectCreate({
      enabled: !!allowCreate && !!channelId && !loading && !error,
      names: (pipelines || []).map((pipeline) => pipeline.name),
    });

  if (newName && channelId) {
    return (
      <SelectPipelineCreateForm
        name={newName}
        channelId={channelId}
        onBack={() => setNewName('')}
      />
    );
  }

  return (
    <Command>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={t('search-pipelines', 'Search pipelines...')}
      />
      <Command.List>
        {!showCreate && (
          <Command.Empty>
            <div className="text-muted-foreground">
              {channelId ? (
                <div className="flex items-center flex-col gap-2">
                  {t('no-pipelines-found', 'No pipelines found')}
                  {allowCreate ? (
                    <span className="text-xs">
                      {t(
                        'type-name-to-create-pipeline',
                        'Type a name to create a pipeline',
                      )}
                    </span>
                  ) : (
                    <Button asChild variant="secondary">
                      <Link
                        to={`/frontline/settings/channels/${channelId}/pipelines`}
                      >
                        {t('add-pipeline', 'Add pipeline')}
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                t('channel-not-selected', 'Channel not selected')
              )}
            </div>
          </Command.Empty>
        )}
        {pipelines?.map((pipeline) => (
          <SelectPipelineCommandItem key={pipeline._id} pipeline={pipeline} />
        ))}
        {showCreate && (
          <SelectCreateCommandItem
            search={search}
            label={t('create-new-pipeline', 'Create new pipeline')}
            onSelect={setNewName}
          />
        )}
      </Command.List>
    </Command>
  );
};

const SelectPipelineRoot = ({
  scope,
  value,
  onValueChange,
  channelId,
  disabled,
  label,
  variant,
}: {
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  value: string;
  channelId?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectPipelineProvider
      value={value}
      onValueChange={onValueChange}
      setOpen={setOpen}
      channelId={channelId}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket
          variant={variant || 'detail'}
          disabled={disabled}
          label={label}
        >
          <SelectPipelineValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant || 'detail'}>
          <SelectPipelineContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectPipelineProvider>
  );
};

const SelectPipelineFilterBar = ({ scope }: { scope?: string }) => {
  const [pipeline, setPipeline] = useQueryState<string>('pipeline');
  const [open, setOpen] = useState(false);

  return (
    <SelectPipelineProvider
      value={pipeline || ''}
      onValueChange={(value) => setPipeline(value as string)}
      setOpen={setOpen}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="filter">
          <SelectPipelineValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant="filter">
          <SelectPipelineContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectPipelineProvider>
  );
};

const SelectPipelineFilterView = () => {
  const [pipeline, setPipeline] = useFilterQueryState<string>('pipeline');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="pipeline">
      <SelectPipelineProvider
        value={pipeline || ''}
        onValueChange={(value) => {
          setPipeline(value as string);
          resetFilterState();
        }}
      >
        <SelectPipelineContent />
      </SelectPipelineProvider>
    </Filter.View>
  );
};

const SelectPipelineFormItem = <
  TFieldValues extends FieldValues = z.infer<typeof addTicketSchema>,
>({
  value,
  onValueChange,
  form,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  form?: UseFormReturn<TFieldValues>;
  label?: string;
}) => {
  const control = form?.control as Control<FieldValues> | undefined;
  const channelId: string | undefined = useWatch({
    name: 'channelId',
    control,
  });
  const [open, setOpen] = useState(false);
  const { pipelines } = useGetPipelines({
    variables: {
      filter: {
        channelId,
        applyVisibilityFilter: true,
      },
    },
    skip: !channelId,
  });
  useEffect(() => {
    if (pipelines?.length && !value) {
      onValueChange(pipelines[0]._id);
    }
  }, [pipelines, value, onValueChange]);
  return (
    <SelectPipelineProvider
      value={value}
      onValueChange={onValueChange}
      setOpen={setOpen}
      channelId={channelId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form" label={label}>
          <SelectPipelineValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectPipelineContent allowCreate />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectPipelineProvider>
  );
};

export const SelectPipeline = Object.assign(SelectPipelineRoot, {
  Provider: SelectPipelineProvider,
  Content: SelectPipelineContent,
  FilterBar: SelectPipelineFilterBar,
  FilterView: SelectPipelineFilterView,
  FormItem: SelectPipelineFormItem,
});
