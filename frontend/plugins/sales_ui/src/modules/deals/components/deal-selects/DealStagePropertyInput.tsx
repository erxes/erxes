import {
  Combobox,
  Command,
  PopoverScoped,
  TPropertyInputMeta,
  TPropertyInputProps,
} from 'erxes-ui';
import { useState } from 'react';
import { useBoards, usePipelines, useStages } from 'ui-modules';
import { useTranslation } from 'react-i18next';

const getMetaValue = (meta: TPropertyInputMeta | undefined, key: string) =>
  typeof meta?.[key] === 'string' ? (meta[key] as string) : '';

type ScopeOption = { _id: string; name?: string };

const ScopeSelect = ({
  value,
  options,
  loading,
  disabled,
  placeholder,
  onSelect,
}: {
  value: string;
  options: ScopeOption[];
  loading?: boolean;
  disabled?: boolean;
  placeholder: string;
  onSelect: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option._id === value);

  return (
    <PopoverScoped open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full" disabled={disabled}>
        <Combobox.Value value={selected?.name} placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={placeholder} />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {options.map((option) => (
              <Command.Item
                key={option._id}
                value={option.name || option._id}
                onSelect={() => {
                  onSelect(option._id);
                  setOpen(false);
                }}
              >
                <span className="flex-1 truncate">{option.name || '-'}</span>
                <Combobox.Check checked={value === option._id} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};

export const DealStagePropertyInput = ({
  value,
  onValueChange,
  meta,
  onMetaChange,
  disabled,
}: TPropertyInputProps) => {
  const { t } = useTranslation('sales');
  const boardId = getMetaValue(meta, 'boardId');
  const pipelineId = getMetaValue(meta, 'pipelineId');
  const [open, setOpen] = useState(false);

  const { boards = [], loading: boardsLoading } = useBoards();
  const { pipelines = [], loading: pipelinesLoading } = usePipelines({
    variables: { boardId },
    skip: !boardId,
  });
  const { stages = [], loading: stagesLoading } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
  });

  const selectedStage = stages.find((stage) => stage._id === value);

  return (
    <PopoverScoped open={open} onOpenChange={setOpen}>
      <Combobox.TriggerBase
        className="w-full h-7 font-medium max-w-none"
        disabled={disabled}
      >
        <Combobox.Value
          value={selectedStage?.name}
          placeholder={t('select-stage', 'Select Stage')}
        />
      </Combobox.TriggerBase>
      <Combobox.Content
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
        sideOffset={8}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid grid-cols-1 gap-2 border-b p-2">
          <ScopeSelect
            value={boardId}
            options={boards}
            loading={boardsLoading}
            disabled={disabled}
            placeholder={t('select-board', 'Select Board')}
            onSelect={(nextBoardId) => {
              onMetaChange({
                ...(meta || {}),
                boardId: nextBoardId,
                pipelineId: '',
              });
              onValueChange('');
            }}
          />
          <ScopeSelect
            value={pipelineId}
            options={pipelines}
            loading={pipelinesLoading}
            disabled={disabled || !boardId}
            placeholder={t('select-pipeline', 'Select Pipeline')}
            onSelect={(nextPipelineId) => {
              onMetaChange({
                ...(meta || {}),
                boardId,
                pipelineId: nextPipelineId,
              });
              onValueChange('');
            }}
          />
        </div>
        <Command>
          <Command.Input
            placeholder={t('search-stage', 'Search stage...')}
            disabled={!pipelineId}
          />
          <Command.List>
            <Combobox.Empty loading={stagesLoading} />
            {!pipelineId ? (
              <div className="p-2 text-sm text-accent-foreground/70">
                {t('select-pipeline-first', 'Please select a pipeline first')}
              </div>
            ) : (
              stages.map((stage) => (
                <Command.Item
                  key={stage._id}
                  value={stage.name || stage._id}
                  onSelect={() => {
                    onValueChange(stage._id);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1 truncate">{stage.name || '-'}</span>
                  <Combobox.Check checked={value === stage._id} />
                </Command.Item>
              ))
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
