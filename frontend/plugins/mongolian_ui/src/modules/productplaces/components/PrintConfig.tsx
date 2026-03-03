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

// Import GraphQL from client files
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
type Props = {
  currentStageId: string;
  configCode?: string; // optional, defaults to 'dealsPrintConfig'
};

const emptyForm: PerPrintConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  conditions: [],
};

const PrintConfig: React.FC<Props> = ({
  currentStageId,
  configCode = 'dealsPrintConfig',
}) => {
  const form = useForm();

  // UI-only saved list
  const [savedConfigs, setSavedConfigs] = useState<PerPrintConfig[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Active form data
  const [formData, setFormData] = useState<PerPrintConfig>({
    ...emptyForm,
    stageId: currentStageId,
  });

  // GraphQL hooks
  const { data, loading, refetch } = useQuery(MN_CONFIGS, {
    variables: { code: configCode },
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
          ...obj,
        } as PerPrintConfig & { _id?: string };
      });
      setSavedConfigs(transformed);
    }
  }, [data]);

  // Sync form with active config
  useEffect(() => {
    if (activeIndex !== null) {
      const selected = savedConfigs[activeIndex];
      if (selected) setFormData(selected);
    } else {
      setFormData({ ...emptyForm, stageId: currentStageId });
    }
  }, [activeIndex, savedConfigs, currentStageId]);

  // Field update helper
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

  // ---------- Actions ----------
  const handleSave = async () => {
    try {
      const { _id, ...rest } = formData as any; // _id may exist for editing
      const valueArray = objectToKeyValueArray(rest);

      if (_id) {
        await updateConfig({ variables: { _id, value: valueArray } });
      } else {
        const subId = crypto.randomUUID();
        await createConfig({
          variables: {
            code: configCode,
            subId,
            value: valueArray,
          },
        });
      }

      await refetch(); // refresh list
      setActiveIndex(null);
      setFormData({ ...emptyForm, stageId: currentStageId });
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
      setFormData({ ...emptyForm, stageId: currentStageId });
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleNewConfig = () => {
    setActiveIndex(null);
    setFormData({ ...emptyForm, stageId: currentStageId });
  };

  if (loading && savedConfigs.length === 0) return <div>Loading...</div>;

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
                key={cfg._id || index}
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
          {activeIndex !== null && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}

          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default PrintConfig;
