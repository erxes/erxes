import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Label, Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { nanoid } from 'nanoid';

import { PerPrintConfig, Condition } from '../types';
import PerPrintConditions from './PerPrintConditions';

import { SelectSalesBoard } from '../../ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import { MN_CONFIGS } from '../graphql/clientQueries';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE,
} from '../graphql/clientMutations';

// ---------- Transformers ----------
const objectToKeyValueArray = (obj: Record<string, any>) =>
  Object.entries(obj).map(([key, value]) => ({ key, value }));

const keyValueArrayToObject = (
  arr: Array<{ key: string; value: any }>,
): Record<string, any> => {
  const obj: any = {};
  arr.forEach(({ key, value }) => {
    obj[key] = value;
  });
  return obj;
};

// ---------- Types ----------
export interface PrintConfigData {
  _id?: string;
  subId?: string;
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  conditions: Condition[];
}

const emptyForm: PrintConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  conditions: [],
};

const PrintConfig: React.FC = () => {
  const form = useForm();

  const [savedConfigs, setSavedConfigs] = useState<PrintConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PrintConfigData>(emptyForm);

  // GraphQL hooks
  const { data, loading, refetch } = useQuery(MN_CONFIGS, {
    variables: { code: 'dealsProductsDataPrint' },
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
      const transformed = rawConfigs.map((cfg: any) => {
        const obj = keyValueArrayToObject(cfg.value);
        return {
          _id: cfg._id,
          subId: cfg.subId,
          ...obj,
        } as PrintConfigData;
      });
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

  const updateField = useCallback(
    <K extends keyof PrintConfigData>(key: K, value: PrintConfigData[K]) => {
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

  const handleSave = async () => {
    try {
      const { _id, ...rest } = formData;
      const valueArray = objectToKeyValueArray(rest);

      if (_id) {
        await updateConfig({ variables: { _id, value: valueArray } });
      } else {
        await createConfig({
          variables: {
            code: 'dealsProductsDataPrint',
            subId: rest.stageId,
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

  const handleDelete = async () => {
    if (activeIndex === null) return;
    if (!window.confirm('Delete this print config?')) return;

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
      <div className="w-full h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Print Configuration</h2>
            <Button variant="outline" onClick={handleNewConfig}>
              + New Config
            </Button>
          </div>

          {/* SAVED CONFIGS */}
          {savedConfigs.length > 0 && (
            <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Saved Configs
              </h3>
              <div className="space-y-3">
                {savedConfigs.map((cfg, index) => (
                  <div
                    key={cfg._id || index}
                    onClick={() => setActiveIndex(index)}
                    className={`cursor-pointer rounded-lg border p-4 transition
                      ${
                        index === activeIndex
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/40'
                      }`}
                  >
                    <div className="font-medium">
                      {cfg.title || '(Untitled config)'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Stage: {cfg.stageId || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FORM CARD */}
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            {/* Board, Pipeline, Stage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Print Conditions
              </h3>
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
              <div className="text-center py-6 text-muted-foreground">
                No conditions added
              </div>
            ) : (
              <div className="space-y-6">
                {formData.conditions.map((condition) => (
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

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            {activeIndex !== null && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default PrintConfig;
