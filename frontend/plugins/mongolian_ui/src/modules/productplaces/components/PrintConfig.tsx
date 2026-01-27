import { useEffect, useState } from 'react';
import { Button, Label, Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { nanoid } from 'nanoid';

import { PerPrintConfig, Condition } from '../types';
import PerPrintConditions from './PerPrintConditions';

import { SelectSalesBoard } from '../../ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';

type Props = {
  config: PerPrintConfig | null;
  currentStageId: string;
  save: (config: PerPrintConfig) => void;
  delete: () => void;
};

const PrintConfig: React.FC<Props> = ({
  config,
  currentStageId,
  save,
  delete: deleteConfig,
}) => {
  // provide react-hook-form context (fixes getFieldState error)
  const form = useForm();

  const [localConfig, setLocalConfig] = useState<PerPrintConfig>({
    title: '',
    boardId: '',
    pipelineId: '',
    stageId: currentStageId,
    conditions: [],
  });

  useEffect(() => {
    if (!config) return;

    setLocalConfig({
      title: config.title ?? '',
      boardId: config.boardId ?? '',
      pipelineId: config.pipelineId ?? '',
      stageId: config.stageId ?? currentStageId,
      conditions: config.conditions ?? [],
    });
  }, [config, currentStageId]);

  const updateField = <K extends keyof PerPrintConfig>(
    field: K,
    value: PerPrintConfig[K],
  ) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  const addCondition = () => {
    const newCondition: Condition = {
      id: nanoid(),
      branchId: '',
      departmentId: '',
    };

    setLocalConfig((prev) => ({
      ...prev,
      conditions: [...(prev.conditions ?? []), newCondition],
    }));
  };

  const updateCondition = (id: string, updated: Condition) => {
    setLocalConfig((prev) => ({
      ...prev,
      conditions: (prev.conditions ?? []).map((c) =>
        c.id === id ? updated : c,
      ),
    }));
  };

  const removeCondition = (id: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      conditions: (prev.conditions ?? []).filter((c) => c.id !== id),
    }));
  };

  const handleSave = () => save(localConfig);

  const handleDelete = () => {
    if (window.confirm('Delete this print config?')) {
      deleteConfig();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold">Print Configuration</h2>
          <p className="text-sm text-gray-500">
            Configure product print settings
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-4 rounded border space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <input
              className="w-full p-2 border rounded"
              value={localConfig.title ?? ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Print config title"
            />
          </div>

          {/* Board / Pipeline / Stage */}
          <div className="grid grid-cols-3 gap-4">
            {/* Board */}
            <div className="space-y-2">
              <Label>Board</Label>
              <SelectSalesBoard
                variant="form"
                value={localConfig.boardId}
                onValueChange={(boardId: string) => {
                  setLocalConfig((prev) => ({
                    ...prev,
                    boardId,
                    pipelineId: '',
                    stageId: '',
                  }));
                }}
              />
            </div>

            {/* Pipeline */}
            <div className="space-y-2">
              <Label>Pipeline</Label>
              <SelectPipeline
                variant="form"
                boardId={localConfig.boardId}
                value={localConfig.pipelineId}
                disabled={!localConfig.boardId}
                onValueChange={(pipelineId: string) => {
                  setLocalConfig((prev) => ({
                    ...prev,
                    pipelineId,
                    stageId: '',
                  }));
                }}
              />
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <Label>Stage</Label>
              <SelectStage
                id="product-place-stage"
                variant="form"
                pipelineId={localConfig.pipelineId}
                value={localConfig.stageId}
                disabled={!localConfig.pipelineId}
                onValueChange={(stageId: string) =>
                  updateField('stageId', stageId)
                }
              />
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white p-4 rounded border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Print Conditions</h3>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCondition}
            >
              + Add condition
            </Button>
          </div>

          {(localConfig.conditions ?? []).length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No conditions added
            </div>
          ) : (
            <div className="space-y-4">
              {(localConfig.conditions ?? []).map((condition) => (
                <PerPrintConditions
                  key={condition.id}
                  condition={condition}
                  onChange={updateCondition}
                  onRemove={removeCondition}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>

          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default PrintConfig;
