import { useEffect, useState, useCallback } from 'react';
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

const emptyForm: PerPrintConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  conditions: [],
};

const PrintConfig: React.FC<Props> = ({
  config,
  currentStageId,
  save,
  delete: deleteConfig,
}) => {
  console.log('config prop:', config);
  const form = useForm();

  /** UI-only saved list */
  const [savedConfigs, setSavedConfigs] = useState<PerPrintConfig[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /** active form */
  const [formData, setFormData] = useState<PerPrintConfig>({
    ...emptyForm,
    stageId: currentStageId,
  });

  /** sync form */
  // useEffect(() => {
  //   if (activeIndex !== null) {
  //     const selected = savedConfigs[activeIndex];
  //     if (selected) setFormData(selected);
  //     return;
  //   }

  //   if (!config) {
  //     setFormData({ ...emptyForm, stageId: currentStageId });
  //     return;
  //   }

  //   setFormData({
  //     title: config.title ?? '',
  //     boardId: config.boardId ?? '',
  //     pipelineId: config.pipelineId ?? '',
  //     stageId: config.stageId ?? currentStageId,
  //     conditions: config.conditions ?? [],
  //   });
  // }, [config, activeIndex, savedConfigs, currentStageId]);
  useEffect(() => {
    if (!config) {
      setSavedConfigs([]);
      setFormData({ ...emptyForm });
      setActiveIndex(null);
      return;
    }

    // Backend only returns one config
    setSavedConfigs([config]);
    setActiveIndex(0);

    setFormData({
      title: config.title ?? '',
      boardId: config.boardId ?? '',
      pipelineId: config.pipelineId ?? '',
      stageId: config.stageId ?? '',
      conditions: config.conditions ?? [],
    });
  }, [config]);

  /* ---------- helpers ---------- */
  const updateField = useCallback(
    <K extends keyof PerPrintConfig>(key: K, value: PerPrintConfig[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const addCondition = () => {
    const condition: Condition = {
      id: nanoid(),
      branchId: '',
      departmentId: '',
    };

    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, condition],
    }));
  };

  const updateCondition = (id: string, updated: Condition) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? updated : c)),
    }));
  };

  const removeCondition = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  };

  /* ---------- actions ---------- */
  const handleSave = () => {
    save(formData);

    setSavedConfigs((prev) => {
      if (activeIndex === null) {
        return [...prev, formData];
      }

      const next = [...prev];
      next[activeIndex] = formData;
      return next;
    });

    setActiveIndex(null);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this print config?')) return;

    await deleteConfig();
    setSavedConfigs([]);
    setActiveIndex(null);
    setFormData({ ...emptyForm, stageId: currentStageId });
  };

  const handleNewConfig = () => {
    setActiveIndex(null);
    setFormData({ ...emptyForm, stageId: currentStageId });
  };

  /* ================= RENDER ================= */

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Print Configuration</h2>

          <Button type="button" variant="outline" onClick={handleNewConfig}>
            + New Config
          </Button>
        </div>

        {/* SAVED LIST */}
        {savedConfigs.length > 0 && (
          <div className="rounded border bg-background p-4 space-y-2">
            <h3 className="font-medium">Saved configs</h3>

            {savedConfigs.map((cfg, index) => (
              <div
                key={`${cfg.stageId}-${index}`}
                className={`cursor-pointer rounded px-3 py-2 border
                  ${index === activeIndex ? 'bg-primary/10' : 'hover:bg-muted'}`}
                onClick={() => setActiveIndex(index)}
              >
                <div className="font-medium">
                  {cfg.title || '(Untitled config)'}
                </div>
                <div className="text-xs text-gray-500">
                  Stage: {cfg.stageId || '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white p-4 rounded border space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <input
              className="w-full p-2 border rounded"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Board</Label>
              <SelectSalesBoard
                variant="form"
                value={formData.boardId || ''}
                onValueChange={(boardId: string) => {
                  setFormData((prev) => ({
                    ...prev,
                    boardId,
                    pipelineId: '',
                    stageId: '',
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Pipeline</Label>
              <SelectPipeline
                variant="form"
                boardId={formData.boardId || ''}
                value={formData.pipelineId || ''}
                disabled={!formData.boardId}
                onValueChange={(pipelineId: string) => {
                  setFormData((prev) => ({
                    ...prev,
                    pipelineId,
                    stageId: '',
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Stage</Label>
              <SelectStage
                id="print-stage"
                variant="form"
                pipelineId={formData.pipelineId || ''}
                value={formData.stageId || ''}
                disabled={!formData.pipelineId}
                onValueChange={(stageId: string) =>
                  updateField('stageId', stageId)
                }
              />
            </div>
          </div>
        </div>

        {/* CONDITIONS */}
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

          {formData.conditions.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No conditions added
            </div>
          ) : (
            formData.conditions.map((condition) => (
              <PerPrintConditions
                key={condition.id}
                condition={condition}
                onChange={updateCondition}
                onRemove={removeCondition}
              />
            ))
          )}
        </div>

        {/* ACTIONS */}
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
