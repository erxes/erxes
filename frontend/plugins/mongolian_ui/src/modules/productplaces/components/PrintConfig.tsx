import React from 'react';
import { Button, Label } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { Condition } from '../types';
import PerPrintConditions from './PerPrintConditions';
import { SelectSalesBoard } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import { useMnConfigManager } from '../hooks/useMnConfigManager';

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

// ---------- Empty form ----------
const emptyForm: PrintConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  conditions: [],
};

const PrintConfig: React.FC = () => {
  const {
    savedConfigs,
    activeIndex,
    setActiveIndex,
    formData,
    updateField,
    loading,
    error,
    queryLoading,
    save,
    del,
  } = useMnConfigManager<PrintConfigData>(
    'dealsProductsDataPrint',
    emptyForm
  );

  // UI‑specific handlers
  const handleBoardChange = (boardId: string) => {
    updateField('boardId', boardId);
    updateField('pipelineId', '');
    updateField('stageId', '');
  };

  const handlePipelineChange = (pipelineId: string) => {
    updateField('pipelineId', pipelineId);
    updateField('stageId', '');
  };

  const addCondition = () => {
    const condition: Condition = {
      id: nanoid(),
      branchId: '',
      departmentId: '',
    };
    updateField('conditions', [...formData.conditions, condition]);
  };

  const updateCondition = (id: string, updated: Condition) => {
    updateField(
      'conditions',
      formData.conditions.map((c) => (c.id === id ? updated : c))
    );
  };

  const removeCondition = (id: string) => {
    updateField(
      'conditions',
      formData.conditions.filter((c) => c.id !== id)
    );
  };

  if (queryLoading && savedConfigs.length === 0) return <div>Loading...</div>;

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Print Configuration</h2>
          <Button variant="outline" onClick={() => setActiveIndex(null)} disabled={loading}>
            + New Config
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* SAVED CONFIGS */}
        {savedConfigs.length > 0 && (
          <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Saved Configs</h3>
            <div className="space-y-3">
              {savedConfigs.map((cfg, index) => (
                <div
                  key={cfg._id || index}
                  onClick={() => setActiveIndex(index)}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    index === activeIndex
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="font-medium">{cfg.title || '(Untitled config)'}</div>
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
          <div className="space-y-2">
            <Label>Title</Label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Board</Label>
              <SelectSalesBoard
                variant="form"
                value={formData.boardId || ''}
                onValueChange={handleBoardChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Pipeline</Label>
              <SelectPipeline
                variant="form"
                boardId={formData.boardId || ''}
                value={formData.pipelineId || ''}
                disabled={!formData.boardId || loading}
                onValueChange={handlePipelineChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <SelectStage
                id="print-stage"
                variant="form"
                pipelineId={formData.pipelineId || ''}
                value={formData.stageId || ''}
                disabled={!formData.pipelineId || loading}
                onValueChange={(stageId: string) => updateField('stageId', stageId)}
              />
            </div>
          </div>
        </div>

        {/* CONDITIONS */}
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Print Conditions</h3>
            <Button type="button" variant="outline" size="sm" onClick={addCondition} disabled={loading}>
              + Add condition
            </Button>
          </div>
          {formData.conditions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No conditions added</div>
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
            <Button type="button" variant="destructive" onClick={del} disabled={loading}>
              Delete
            </Button>
          )}
          <Button type="button" onClick={save} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrintConfig;