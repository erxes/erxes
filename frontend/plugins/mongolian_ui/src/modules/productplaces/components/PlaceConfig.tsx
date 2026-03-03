import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Label, Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';

import PerConditions from './PerConditions';
import { PlaceConditionUI } from '../types';
import { SelectSalesBoard } from '../../ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';

// Import GraphQL from client files
import { MN_CONFIGS } from '../graphql/clientQueries';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE,
} from '../graphql/clientMutations';

// ---------- Types ----------
export interface PlaceConfigData {
  _id?: string;
  subId?: string; // add subId to interface
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  checkPricing: boolean;
  conditions: PlaceConditionUI[];
}

// ---------- Transformers ----------
const objectToKeyValueArray = (obj: Record<string, any>) =>
  Object.entries(obj).map(([key, value]) => ({ key, value }));

const keyValueArrayToObject = (
  arr: Array<{ key: string; value: any }>,
): PlaceConfigData => {
  const obj: any = {};
  arr.forEach(({ key, value }) => {
    obj[key] = value;
  });
  return obj as PlaceConfigData;
};

// ---------- Component ----------
const emptyForm: PlaceConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  checkPricing: false,
  conditions: [],
};

const PlaceConfig: React.FC = () => {
  const form = useForm();

  // Local UI state
  const [savedConfigs, setSavedConfigs] = useState<PlaceConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PlaceConfigData>(emptyForm);

  // GraphQL hooks
  const { data, loading, refetch } = useQuery(MN_CONFIGS, {
    variables: { code: 'dealsProductsDataPlaces' },
    fetchPolicy: 'network-only',
  });

  const [createConfig] = useMutation(MN_CONFIGS_CREATE);
  const [updateConfig] = useMutation(MN_CONFIGS_UPDATE);
  const [deleteConfig] = useMutation(MN_CONFIGS_REMOVE);

  // Load configs from backend into local state
  useEffect(() => {
    if (data?.mnConfigs) {
      const rawConfigs = Array.isArray(data.mnConfigs)
        ? data.mnConfigs
        : Object.values(data.mnConfigs);
      const transformed = rawConfigs.map((cfg: any) => ({
        _id: cfg._id,
        subId: cfg.subId, // include subId from the document
        ...keyValueArrayToObject(cfg.value),
      }));
      setSavedConfigs(transformed);
    }
  }, [data]);

  // Sync form with active config
  useEffect(() => {
    if (activeIndex !== null) {
      setFormData(savedConfigs[activeIndex] ?? emptyForm);
    } else {
      setFormData(emptyForm);
    }
  }, [activeIndex, savedConfigs]);

  // Field update helper
  const updateField = useCallback(
    <K extends keyof PlaceConfigData>(key: K, value: PlaceConfigData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Condition handlers
  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { id: crypto.randomUUID(), branchId: '', departmentId: '' },
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

  // Save (create or update)
  const handleSave = async () => {
    try {
      const { _id, subId, ...rest } = formData;
      const valueArray = objectToKeyValueArray(rest);

      if (_id) {
        // Update existing config – keep same subId
        await updateConfig({ variables: { _id, value: valueArray } });
      } else {
        // Create new config – use the selected stageId as subId
        await createConfig({
          variables: {
            code: 'dealsProductsDataPlaces',
            subId: rest.stageId, // use the stage ID from the form
            value: valueArray,
          },
        });
      }

      await refetch();
      setActiveIndex(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (activeIndex === null) return;
    if (!window.confirm('Delete this config?')) return;

    const config = savedConfigs[activeIndex];
    if (!config._id) return;

    try {
      await deleteConfig({ variables: { _id: config._id } });
      await refetch();
      setActiveIndex(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleNewConfig = () => {
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  if (loading && savedConfigs.length === 0) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Product Places Config</h1>
          <Button variant="outline" onClick={handleNewConfig}>
            + New Config
          </Button>
        </div>

        {/* Saved list */}
        {savedConfigs.length > 0 && (
          <div className="border rounded p-3 space-y-2">
            <h3 className="font-medium">Saved configs</h3>
            {savedConfigs.map((cfg, i) => (
              <div
                key={cfg._id || i}
                className={`cursor-pointer p-2 rounded border ${
                  i === activeIndex ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
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

        {/* Form fields */}
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
                setFormData((p) => ({ ...p, pipelineId, stageId: '' }))
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

        {/* Conditions */}
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

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {activeIndex !== null && (
            <Button variant="destructive" onClick={handleDelete}>
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
