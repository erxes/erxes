import React, { useEffect, useState } from 'react';
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

type Props = {
  config: PerSplitConfig | null;
  currentStageId: string;
  save: (config: PerSplitConfig) => void;
  delete: () => void;
};

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

const SplitConfig: React.FC<Props> = ({
  config,
  currentStageId,
  save,
  delete: deleteConfig,
}) => {
  const form = useForm();

  /** UI-only saved configs */
  const [savedConfigs, setSavedConfigs] = useState<PerSplitConfig[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /** Active form */
  const [localConfig, setLocalConfig] = useState<PerSplitConfig>(
    normalize({}, currentStageId),
  );

  /* sync form */
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

  const update = <K extends keyof PerSplitConfig>(
    key: K,
    value: PerSplitConfig[K],
  ) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- actions ---------- */
  const handleSave = () => {
    save(localConfig);

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

  const handleDelete = () => {
    if (!window.confirm('Delete this split config?')) return;

    deleteConfig();
    setSavedConfigs([]);
    setActiveIndex(null);
    setLocalConfig(normalize({}, currentStageId));
  };

  const handleNewConfig = () => {
    setActiveIndex(null);
    setLocalConfig(normalize({}, currentStageId));
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">Split Configuration</h2>
          </div>

          <Button type="button" variant="outline" onClick={handleNewConfig}>
            + New Config
          </Button>
        </div>

        {/* SAVED CONFIG LIST */}
        {savedConfigs.length > 0 && (
          <div className="rounded border bg-background p-4 space-y-2">
            <h3 className="font-medium">Saved configs</h3>

            {savedConfigs.map((cfg, index) => (
              <div
                key={`${cfg.stageId}-${index}`}
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

        {/* BASIC INFO */}
        <div className="bg-white p-4 rounded border space-y-4">
          <div>
            <Label>Title</Label>
            <input
              className="w-full p-2 border rounded"
              value={localConfig.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
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

            <div>
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

            <div>
              <Label>Stage</Label>
              <SelectStage
                id="split-stage"
                variant="form"
                pipelineId={localConfig.pipelineId || ''}
                value={localConfig.stageId || ''}
                disabled={!localConfig.pipelineId}
                onValueChange={(stageId: string) => update('stageId', stageId)}
              />
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="bg-white p-4 rounded border space-y-3">
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
        <div className="bg-white p-4 rounded border space-y-3">
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
        <div className="bg-white p-4 rounded border space-y-3">
          <Label>Exclude Products</Label>
          <SelectProducts
            value={localConfig.excludeProductIds}
            onChange={(v) => update('excludeProductIds', v)}
          />
        </div>

        {/* SEGMENTS */}
        <div className="bg-white p-4 rounded border space-y-3">
          <Label>Segment</Label>
          <SelectSegments
            contentTypes={['core:product']}
            value={getSingle(localConfig.segmentIds)}
            onChange={(id) => update('segmentIds', toSingleArray(id))}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete Config
          </Button>

          <Button type="button" onClick={handleSave}>
            Save Config
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default SplitConfig;
