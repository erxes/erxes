import { useEffect, useState, useCallback } from 'react';
import { Button, Label, Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { nanoid } from 'nanoid';

import { PerPrintConfig, Condition } from '../types';
import PerPrintConditions from './PerPrintConditions';

import { SelectSalesBoard } from '../../ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';

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
interface PrintConfigProps {
  config: PerPrintConfig | null;
  save: (data: PerPrintConfig) => Promise<boolean>;
  deleteConfig: () => Promise<void>;
  loading?: boolean;
}

const emptyForm: PerPrintConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  conditions: [],
};

const PrintConfig: React.FC<PrintConfigProps> = ({
  config,
  save,
  deleteConfig,
  loading = false,
}) => {
  const form = useForm();

  const [formData, setFormData] = useState<PerPrintConfig>(emptyForm);

  // Sync form with incoming config
  useEffect(() => {
    if (!config) {
      setFormData(emptyForm);
      return;
    }

    setFormData({
      title: config.title ?? '',
      boardId: config.boardId ?? '',
      pipelineId: config.pipelineId ?? '',
      stageId: config.stageId ?? '',
      conditions: config.conditions ?? [],
    });
  }, [config]);

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

  const handleSave = async () => {
    const ok = await save(formData);
    if (!ok) return;
    // Optional: keep saved state if needed
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this print config?')) return;
    await deleteConfig();
    setFormData(emptyForm);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <div className="w-full h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Print Configuration</h2>
          </div>

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
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>

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
