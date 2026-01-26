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
  delete: () => Promise<void>;
  loading?: boolean;

  // ✅ add this if you have "new config" action in parent
  onNewConfig?: () => void;
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
  delete: deleteConfig,
  loading = false,
  onNewConfig,
}) => {
  const form = useForm();

  const [formData, setFormData] = useState<PlaceConfigData>(emptyForm);

  useEffect(() => {
    if (!config) {
      setFormData(emptyForm);
      return;
    }

    setFormData({
      _id: config._id,
      title: config.title ?? '',
      boardId: config.boardId ?? '',
      pipelineId: config.pipelineId ?? '',
      stageId: config.stageId ?? '',
      checkPricing: Boolean(config.checkPricing),
      conditions: config.conditions ?? [],
    });
  }, [config]);

  const updateField = useCallback(
    <K extends keyof PlaceConfigData>(key: K, value: PlaceConfigData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const addCondition = () => {
    const condition: PlaceConditionUI = {
      id: crypto.randomUUID(),
      productCategoryIds: [],
      excludeCategoryIds: [],
      productTagIds: [],
      excludeTagIds: [],
      excludeProductIds: [],
      ltCount: undefined,
      gtCount: undefined,
      ltUnitPrice: undefined,
      gtUnitPrice: undefined,
      subUomType: undefined,
      branchId: '',
      departmentId: '',
    };

    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, condition],
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

  const handleSave = async () => {
    await save(formData);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this config?')) return;
    await deleteConfig();
    setFormData(emptyForm);
  };

  const handleNewConfig = () => {
    // if parent provides action
    if (onNewConfig) return onNewConfig();

    // fallback: reset locally
    setFormData(emptyForm);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Product Places Config</h1>

          <Button type="button" variant="outline" onClick={handleNewConfig}>
            + New Config
          </Button>
        </div>

        {/* FORM */}
        <div className="rounded border bg-background p-6 space-y-6">
          <div className="space-y-1.5">
            <Label>Config title</Label>
            <input
              className="h-9 w-full rounded border px-3 text-sm"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <Label>Stage</Label>
              <SelectStage
                id="place-stage"
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.checkPricing}
              onChange={(e) => updateField('checkPricing', e.target.checked)}
            />
            <Label>Check pricing</Label>
          </div>
        </div>

        {/* CONDITIONS */}
        <div className="space-y-6">
          {formData.conditions.map((condition) => (
            <PerConditions
              key={condition.id}
              condition={condition}
              onChange={updateCondition}
              onRemove={deleteCondition}
            />
          ))}

          <Button type="button" variant="outline" onClick={addCondition}>
            + Add condition
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          {config?._id && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Config
            </Button>
          )}

          <Button type="button" onClick={handleSave}>
            Save Config
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default PlaceConfig;
