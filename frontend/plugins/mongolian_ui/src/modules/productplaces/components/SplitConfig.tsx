import React from 'react';
import { Button, Label } from 'erxes-ui';
import { useMnConfigManager } from '../hooks/useMnConfigManager';
import { PerSplitConfig } from '../types';
import { SelectSalesBoard } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import SelectProductCategories from '../selects/SelectProductCategories';
import SelectProductTags from '../selects/SelectTags';
import SelectProducts from '../selects/SelectProducts';
import SelectSegments from '../selects/SelectSegments';

// ---------- Type definition (exactly as you had) ----------
export interface SplitConfigData extends PerSplitConfig {
  _id?: string;
  subId?: string;
}

// ---------- Empty form ----------
const emptyForm: SplitConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  productCategoryIds: [],
  excludeCategoryIds: [],
  productTagIds: [],
  excludeTagIds: [],
  excludeProductIds: [],
  segmentIds: [],
  subUomType: undefined,
  gtCount: undefined,
  ltCount: undefined,
  gtUnitPrice: undefined,
  ltUnitPrice: undefined,
};

// Helpers for single-value ↔ array conversion
const getSingle = (arr: string[]) => arr[0] || '';
const toSingleArray = (id?: string) => (id ? [id] : []);

const SplitConfig: React.FC = () => {
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
  } = useMnConfigManager<SplitConfigData>(
    'dealsProductsDataSplit',
    emptyForm
  );

  const handleBoardChange = (boardId: string) => {
    updateField('boardId', boardId);
    updateField('pipelineId', '');
    updateField('stageId', '');
  };

  const handlePipelineChange = (pipelineId: string) => {
    updateField('pipelineId', pipelineId);
    updateField('stageId', '');
  };

  if (queryLoading && savedConfigs.length === 0) return <div>Loading...</div>;

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Split Configuration</h2>
          <Button variant="outline" onClick={() => setActiveIndex(null)} disabled={loading}>
            + New Config
          </Button>
        </div>

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

        {/* BASIC INFO */}
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
                id="split-stage"
                variant="form"
                pipelineId={formData.pipelineId || ''}
                value={formData.stageId || ''}
                disabled={!formData.pipelineId || loading}
                onValueChange={(stageId: string) => updateField('stageId', stageId)}
              />
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <Label>Include Categories</Label>
          <SelectProductCategories
            value={formData.productCategoryIds}
            onChange={(v) => updateField('productCategoryIds', v)}
            disabled={loading}
          />
          <Label>Exclude Categories</Label>
          <SelectProductCategories
            value={formData.excludeCategoryIds}
            onChange={(v) => updateField('excludeCategoryIds', v)}
            disabled={loading}
          />
        </div>

        {/* TAGS */}
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <Label>Include Tags</Label>
          <SelectProductTags
            value={formData.productTagIds}
            onChange={(v) => updateField('productTagIds', v)}
            disabled={loading}
          />
          <Label>Exclude Tags</Label>
          <SelectProductTags
            value={formData.excludeTagIds}
            onChange={(v) => updateField('excludeTagIds', v)}
            disabled={loading}
          />
        </div>

        {/* PRODUCTS */}
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <Label>Exclude Products</Label>
          <SelectProducts
            value={formData.excludeProductIds}
            onChange={(v) => updateField('excludeProductIds', v)}
            disabled={loading}
          />
        </div>

        {/* SEGMENTS */}
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <Label>Segment</Label>
          <SelectSegments
            contentTypes={['core:product']}
            value={getSingle(formData.segmentIds)}
            onChange={(id) => updateField('segmentIds', toSingleArray(id))}
            disabled={loading}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          {activeIndex !== null && (
            <Button variant="destructive" onClick={del} disabled={loading}>
              Delete Config
            </Button>
          )}
          <Button onClick={save} disabled={loading}>
            {loading ? 'Saving...' : 'Save Config'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SplitConfig;