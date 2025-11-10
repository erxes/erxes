// will add icon later
import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { IPipeline } from '@/pipelines/types';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Filter,
  //   IconComponent,
  PopoverScoped,
  TextOverflowTooltip,
  useFilterContext,
  useFilterQueryState,
  useQueryState,
} from 'erxes-ui';
import React, { useEffect, useState } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { addTicketSchema } from '@/ticket/types';
import { z } from 'zod';
import { Link } from 'react-router';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';

interface SelectPipelineContextType {
  value: string;
  onValueChange: (value: string) => void;
  loading: boolean;
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
  onValueChange: (value: string) => void;
  setOpen?: (open: boolean) => void;
  channelId?: string;
}) => {
  const { pipelines, loading } = useGetPipelines({
    variables: {
      filter: {
        channelId,
      },
    },
    skip: !channelId,
  });

  const handleValueChange = (pipelineId: string) => {
    if (!pipelineId) return;
    onValueChange(pipelineId);
    setOpen?.(false);
  };

  return (
    <SelectPipelineContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        loading,
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
  console.log({ pipelines, value });
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
            {/* <IconComponent
              name={pipeline.icon}
              className="size-4 flex-shrink-0"
            /> */}
            <TextOverflowTooltip value={pipeline.name} className="max-w-32" />
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {/* <IconComponent
        name={selectedPipelines[0]?.icon}
        className="size-4 flex-shrink-0"
      /> */}
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
      onSelect={() => {
        onValueChange(pipeline._id);
      }}
    >
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        {/* <IconComponent name={pipeline.icon} className="size-4" /> */}
        <TextOverflowTooltip value={pipeline.name} />
      </div>
      <Combobox.Check checked={value.includes(pipeline._id)} />
    </Command.Item>
  );
};

const SelectPipelineContent = () => {
  const { pipelines, channelId } = useSelectPipelineContext();
  return (
    <Command>
      <Command.Input placeholder="Search pipelines..." />
      <Command.List>
        <Command.Empty>
          <div className="text-muted-foreground">
            {channelId ? (
              <div className="flex items-center flex-col gap-2">
                No pipelines found
                <Button asChild variant="secondary">
                  <Link
                    to={`/settings/frontline/channels/${channelId}/pipelines`}
                  >
                    Add Pipeline
                  </Link>
                </Button>
              </div>
            ) : (
              'Channel not selected'
            )}
          </div>
        </Command.Empty>
        {pipelines?.map((pipeline) => (
          <SelectPipelineCommandItem key={pipeline._id} pipeline={pipeline} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectPipelineRoot = ({
  variant = 'detail',
  scope,
  value,
  onValueChange,
  channelId,
  id,
}: {
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  value: string;
  channelId?: string;
  onValueChange?: (value: string) => void;
  id: string;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTicket } = useUpdateTicket();
  const handleValueChange = (pipelineId: string) => {
    if (!pipelineId) return;
    updateTicket({
      variables: {
        _id: id,
        pipelineId,
      },
    });
    onValueChange?.(pipelineId);
    setOpen(false);
  };

  return (
    <SelectPipelineProvider
      value={value}
      onValueChange={handleValueChange}
      setOpen={setOpen}
      channelId={channelId}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant={variant}>
          <SelectPipelineValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
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

const SelectPipelineFormItem = ({
  value,
  onValueChange,
  form,
}: {
  value: string;
  onValueChange: (value: string) => void;
  form?: UseFormReturn<z.infer<typeof addTicketSchema>>;
}) => {
  const channelId = useWatch({ name: 'channelId', control: form?.control });
  const [open, setOpen] = useState(false);
  const { pipelines } = useGetPipelines({
    variables: {
      filter: {
        channelId,
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
        <SelectTriggerTicket variant="form">
          <SelectPipelineValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectPipelineContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectPipelineProvider>
  );
};

export const SelectPipeline = Object.assign(SelectPipelineRoot, {
  FilterBar: SelectPipelineFilterBar,
  FilterView: SelectPipelineFilterView,
  FormItem: SelectPipelineFormItem,
});
