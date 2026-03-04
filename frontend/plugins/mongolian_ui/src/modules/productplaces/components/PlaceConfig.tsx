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
      <div className="w-full flex justify-center overflow-y-auto">
        <div className="w-full max-w-5xl px-6 py-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Product Places Config</h1>
            <Button variant="outline" onClick={handleNewConfig}>
              + New Config
            </Button>
          </div>

          {/* Saved Configs */}
          {savedConfigs.length > 0 && (
            <div className="border rounded-xl p-5 space-y-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Saved Configs
              </h3>

              <div className="space-y-3">
                {savedConfigs.map((cfg, i) => (
                  <div
                    key={cfg._id || i}
                    onClick={() => setActiveIndex(i)}
                    className={`cursor-pointer p-4 rounded-lg border transition-all
                    ${
                      i === activeIndex
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/40'
                    }
                  `}
                  >
                    <div className="font-medium">
                      {cfg.title || '(Untitled)'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Stage: {cfg.stageId || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Form Card */}
          <div className="border rounded-xl p-6 bg-white shadow-sm space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <input
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            {/* Selects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Conditions Section */}
          <div className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Conditions
              </h3>
              <Button variant="outline" onClick={addCondition}>
                + Add condition
              </Button>
            </div>

            <div className="space-y-4">
              {formData.conditions.map((c) => (
                <PerConditions
                  key={c.id}
                  condition={c}
                  onChange={updateCondition}
                  onRemove={deleteCondition}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            {activeIndex !== null && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Config
              </Button>
            )}
            <Button onClick={handleSave}>Save Config</Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default PlaceConfig;
