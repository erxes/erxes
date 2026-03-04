import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
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

// Import GraphQL from client files
import { MN_CONFIGS } from '../graphql/clientQueries';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE,
} from '../graphql/clientMutations';

// ---------- Types ----------
// PerSplitConfig should be defined in ../types – we import it.

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

// ---------- Component ----------
type Props = {
  currentStageId: string;
  // Optionally allow passing a code, default to 'dealsSplitConfig'
  configCode?: string;
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
  currentStageId,
  configCode = 'dealsSplitConfig', // default code
}) => {
  const form = useForm();

  // Local UI state
  const [savedConfigs, setSavedConfigs] = useState<PerSplitConfig[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [localConfig, setLocalConfig] = useState<PerSplitConfig>(
    normalize({}, currentStageId),
  );

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
        // The backend value should contain all PerSplitConfig fields
        return {
          _id: cfg._id,
          ...obj,
        } as PerSplitConfig & { _id?: string };
      });
      setSavedConfigs(transformed);
    }
  }, [data]);

  // Sync form with active config
  useEffect(() => {
    if (activeIndex !== null) {
      const selected = savedConfigs[activeIndex];
      if (selected) setLocalConfig(selected);
    } else {
      setLocalConfig(normalize({}, currentStageId));
    }
  }, [activeIndex, savedConfigs, currentStageId]);

  // Field update helper
  const update = <K extends keyof PerSplitConfig>(
    key: K,
    value: PerSplitConfig[K],
  ) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  // ---------- Actions ----------
  const handleSave = async () => {
    try {
      const { _id, ...rest } = localConfig as any; // _id might exist if editing
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

      await refetch();
      setActiveIndex(null);
      setLocalConfig(normalize({}, currentStageId));
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleDelete = async () => {
    if (activeIndex === null) return;
    if (!window.confirm('Delete this split config?')) return;

    const config = savedConfigs[activeIndex];
    if (!config._id) return;

    try {
      await deleteConfig({ variables: { _id: config._id } });
      await refetch();
      setActiveIndex(null);
      setLocalConfig(normalize({}, currentStageId));
    } catch (error) {
      console.error('Delete failed', error);
    }
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
