import React, { useEffect, useState, useCallback } from 'react';
import { Button, Label, Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { PerSplitConfig } from '../types';
import { SelectSalesBoard } from '../../ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import SelectProductCategories from '../selects/SelectProductCategories';
import SelectProductTags from '../selects/SelectTags';
import SelectProducts from '../selects/SelectProducts';
import SelectSegments from '../selects/SelectSegments';

// ---------- Types ----------
interface SplitConfigProps {
  config: PerSplitConfig | null;
  save: (data: PerSplitConfig) => Promise<boolean>;
  deleteConfig: () => Promise<void>;
  loading?: boolean;
  currentStageId?: string;
}

// ---------- Helpers ----------
const normalize = (
  config: Partial<PerSplitConfig>,
  stageId: string,
): PerSplitConfig => ({
  title: config.title ?? '',
  boardId: config.boardId ?? '',
  pipelineId: config.pipelineId ?? '',
  stageId: config.stageId ?? stageId,

  productCategoryIds: config.productCategoryIds ?? [],
  excludeCategoryIds: config.excludeCategoryIds ?? [],
  productTagIds: config.productTagIds ?? [],
  excludeTagIds: config.excludeTagIds ?? [],
  excludeProductIds: config.excludeProductIds ?? [],
  segmentIds: config.segmentIds ?? [],

  subUomType: config.subUomType,
  gtCount: config.gtCount,
  ltCount: config.ltCount,
  gtUnitPrice: config.gtUnitPrice,
  ltUnitPrice: config.ltUnitPrice,
});

const getSingle = (arr: string[]) => arr[0] || '';
const toSingleArray = (id?: string) => (id ? [id] : []);

// ---------- Component ----------
const SplitConfig: React.FC<SplitConfigProps> = ({
  config,
  save,
  deleteConfig,
  loading = false,
  currentStageId = '',
}) => {
  const form = useForm();

  /** UI-only saved configs (just for display in list) */
  const [savedConfigs, setSavedConfigs] = useState<PerSplitConfig[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /** Active form data */
  const [localConfig, setLocalConfig] = useState<PerSplitConfig>(
    normalize({}, currentStageId),
  );

  // Sync with incoming config
  useEffect(() => {
    if (activeIndex !== null) {
      const selected = savedConfigs[activeIndex];
      if (selected) setLocalConfig(selected);
      return;
    }

    if (!config) {
      setLocalConfig(normalize({}, currentStageId));
      return;
    }

    setLocalConfig(normalize(config, currentStageId));
  }, [config, activeIndex, savedConfigs, currentStageId]);

  // If there's a config from parent, add it to savedConfigs (if not already)
  useEffect(() => {
    if (config && !savedConfigs.some((c) => c.stageId === config.stageId)) {
      setSavedConfigs((prev) => [...prev, config as PerSplitConfig]);
    }
  }, [config]);

  const update = useCallback(
    <K extends keyof PerSplitConfig>(key: K, value: PerSplitConfig[K]) => {
      setLocalConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ---------- Actions ----------
  const handleSave = async () => {
    const ok = await save(localConfig);
    if (!ok) return;

    setSavedConfigs((prev) => {
      if (activeIndex === null) {
        return [...prev, localConfig];
      }
      const next = [...prev];
      next[activeIndex] = localConfig;
      return next;
    });

    setActiveIndex(null);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this split config?')) return;
    await deleteConfig();
    setSavedConfigs([]);
    setActiveIndex(null);
    setLocalConfig(normalize({}, currentStageId));
  };

  const handleNewConfig = () => {
    setActiveIndex(null);
    setLocalConfig(normalize({}, currentStageId));
  };

  if (loading && savedConfigs.length === 0) return <div>Loading...</div>;

  return (
    <Form {...form}>
      {/* SCROLL WRAPPER */}
      <div className="w-full h-full overflow-y-auto">
        {/* CENTERED CONTAINER */}
        <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Split Configuration</h2>

            <Button type="button" variant="outline" onClick={handleNewConfig}>
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
                    key={`${cfg.stageId}-${index}`}
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

          {/* BASIC INFO */}
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={localConfig.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Board</Label>
                <SelectSalesBoard
                  variant="form"
                  value={localConfig.boardId || ''}
                  onValueChange={(boardId: string) =>
                    setLocalConfig((p) => ({
                      ...p,
                      boardId,
                      pipelineId: '',
                      stageId: '',
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Pipeline</Label>
                <SelectPipeline
                  variant="form"
                  boardId={localConfig.boardId || ''}
                  value={localConfig.pipelineId || ''}
                  disabled={!localConfig.boardId}
                  onValueChange={(pipelineId: string) =>
                    setLocalConfig((p) => ({
                      ...p,
                      pipelineId,
                      stageId: '',
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Stage</Label>
                <SelectStage
                  id="split-stage"
                  variant="form"
                  pipelineId={localConfig.pipelineId || ''}
                  value={localConfig.stageId || ''}
                  disabled={!localConfig.pipelineId}
                  onValueChange={(stageId: string) =>
                    update('stageId', stageId)
                  }
                />
              </div>
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <Label>Include Categories</Label>
            <SelectProductCategories
              value={localConfig.productCategoryIds}
              onChange={(v) => update('productCategoryIds', v)}
            />

            <Label>Exclude Categories</Label>
            <SelectProductCategories
              value={localConfig.excludeCategoryIds}
              onChange={(v) => update('excludeCategoryIds', v)}
            />
          </div>

          {/* TAGS */}
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <Label>Include Tags</Label>
            <SelectProductTags
              value={localConfig.productTagIds}
              onChange={(v) => update('productTagIds', v)}
            />

            <Label>Exclude Tags</Label>
            <SelectProductTags
              value={localConfig.excludeTagIds}
              onChange={(v) => update('excludeTagIds', v)}
            />
          </div>

          {/* PRODUCTS */}
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <Label>Exclude Products</Label>
            <SelectProducts
              value={localConfig.excludeProductIds}
              onChange={(v) => update('excludeProductIds', v)}
            />
          </div>

          {/* SEGMENTS */}
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <Label>Segment</Label>
            <SelectSegments
              contentTypes={['core:product']}
              value={getSingle(localConfig.segmentIds)}
              onChange={(id) => update('segmentIds', toSingleArray(id))}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            {activeIndex !== null && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete Config
              </Button>
            )}

            <Button type="button" onClick={handleSave}>
              Save Config
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default SplitConfig;
