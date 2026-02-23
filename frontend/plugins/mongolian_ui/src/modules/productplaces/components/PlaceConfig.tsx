import React, { useEffect, useState, useCallback } from 'react';
import { Button, Label, Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';

import PerConditions from './PerConditions';
import { PlaceConditionUI } from '../types';

import { SelectSalesBoard } from '../../ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';

interface PlaceConfigData {
  _id?: string;
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  checkPricing: boolean;
  conditions: PlaceConditionUI[];
}

interface PlaceConfigProps {
  config: PlaceConfigData | null;
  save: (data: PlaceConfigData) => Promise<boolean>;
  loading?: boolean;
}

const emptyForm: PlaceConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  checkPricing: false,
  conditions: [],
};

const PlaceConfig: React.FC<PlaceConfigProps> = ({
  config,
  save,
  loading = false,
}) => {
  const form = useForm();

  /** UI-only saved configs */
  const [savedConfigs, setSavedConfigs] = useState<PlaceConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<PlaceConfigData>(emptyForm);

  /* sync form */
  useEffect(() => {
    if (activeIndex !== null) {
      setFormData(savedConfigs[activeIndex] ?? emptyForm);
      return;
    }

    if (!config) {
      setFormData(emptyForm);
      return;
    }

    setFormData({
      title: config.title ?? '',
      boardId: config.boardId ?? '',
      pipelineId: config.pipelineId ?? '',
      stageId: config.stageId ?? '',
      checkPricing: Boolean(config.checkPricing),
      conditions: config.conditions ?? [],
    });
  }, [config, activeIndex, savedConfigs]);

  /* helpers */
  const updateField = useCallback(
    <K extends keyof PlaceConfigData>(key: K, value: PlaceConfigData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: crypto.randomUUID(),
          branchId: '',
          departmentId: '',
        },
      ],
    }));
  };

  const updateCondition = (id: string, updated: PlaceConditionUI) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? updated : c)),
    }));
  };

  const deleteCondition = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  };

  /* actions */
  const handleSave = async () => {
    const ok = await save(formData);
    if (!ok) return;

    setSavedConfigs((prev) => {
      if (activeIndex === null) return [...prev, formData];
      const next = [...prev];
      next[activeIndex] = formData;
      return next;
    });

    setActiveIndex(null);
  };

  const handleDeleteUI = () => {
    if (activeIndex === null) return;
    if (!window.confirm('Remove this config from list?')) return;

    setSavedConfigs((prev) => prev.filter((_, i) => i !== activeIndex));
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  const handleNewConfig = () => {
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Product Places Config</h1>
          <Button variant="outline" onClick={handleNewConfig}>
            + New Config
          </Button>
        </div>

        {/* SAVED LIST */}
        {savedConfigs.length > 0 && (
          <div className="border rounded p-3 space-y-2">
            <h3 className="font-medium">Saved configs</h3>

            {savedConfigs.map((cfg, i) => (
              <div
                key={i}
                className={`cursor-pointer p-2 rounded border
                  ${i === activeIndex ? 'bg-primary/10' : 'hover:bg-muted'}`}
                onClick={() => setActiveIndex(i)}
              >
                <div className="font-medium">{cfg.title || '(Untitled)'}</div>
                <div className="text-xs text-gray-500">
                  Stage: {cfg.stageId || '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORM */}
        <div className="border rounded p-6 space-y-6">
          <div>
            <Label>Title</Label>
            <input
              className="w-full border rounded p-2"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <SelectSalesBoard
              variant="form"
              value={formData.boardId}
              onValueChange={(boardId) =>
                setFormData((p) => ({
                  ...p,
                  boardId,
                  pipelineId: '',
                  stageId: '',
                }))
              }
            />

            <SelectPipeline
              variant="form"
              boardId={formData.boardId}
              value={formData.pipelineId}
              disabled={!formData.boardId}
              onValueChange={(pipelineId) =>
                setFormData((p) => ({
                  ...p,
                  pipelineId,
                  stageId: '',
                }))
              }
            />

            <SelectStage
              id="place-stage"
              variant="form"
              pipelineId={formData.pipelineId}
              value={formData.stageId}
              disabled={!formData.pipelineId}
              onValueChange={(stageId) => updateField('stageId', stageId)}
            />
          </div>
        </div>

        {/* CONDITIONS */}
        <div className="space-y-4">
          {formData.conditions.map((c) => (
            <PerConditions
              key={c.id}
              condition={c}
              onChange={updateCondition}
              onRemove={deleteCondition}
            />
          ))}

          <Button variant="outline" onClick={addCondition}>
            + Add condition
          </Button>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          {activeIndex !== null && (
            <Button variant="destructive" onClick={handleDeleteUI}>
              Delete Config
            </Button>
          )}

          <Button onClick={handleSave}>Save Config</Button>
        </div>
      </div>
    </Form>
  );
};

export default PlaceConfig;
