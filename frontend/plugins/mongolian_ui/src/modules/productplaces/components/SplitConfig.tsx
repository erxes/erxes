import React, { useEffect, useState } from 'react';
import { Button, Label, Form, Select } from 'erxes-ui';
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

const CLEAR_VALUE = '__clear__';

const emptyConfig = (currentStageId: string): PerSplitConfig => ({
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: currentStageId,

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
});

const getSingle = (arr?: string[]) => (arr?.length ? arr[0] : '');
const toSingleArray = (id?: string) => (id ? [id] : []);

const SplitConfig: React.FC<Props> = ({
  config,
  currentStageId,
  save,
  delete: deleteConfig,
}) => {
  // required for erxes-ui <Form /> (prevents getFieldState crash)
  const form = useForm();

  const [localConfig, setLocalConfig] = useState<PerSplitConfig>(
    config ?? emptyConfig(currentStageId),
  );

  useEffect(() => {
    if (!config) {
      setLocalConfig(emptyConfig(currentStageId));
      return;
    }

    setLocalConfig({
      ...emptyConfig(currentStageId),
      ...config,
      boardId: config.boardId ?? '',
      pipelineId: config.pipelineId ?? '',
      stageId: config.stageId ?? currentStageId,
    });
  }, [config, currentStageId]);

  const updateField = <K extends keyof PerSplitConfig>(
    field: K,
    value: PerSplitConfig[K],
  ) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => save(localConfig);

  const handleDelete = () => {
    if (window.confirm('Delete this split config?')) {
      deleteConfig();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <h2 className="text-lg font-semibold">Split Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure product split settings for stage: {currentStageId}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setLocalConfig(emptyConfig(currentStageId))}
      >
        + New Config
      </Button>
    </div>

        {/* Basic Info */}
        <div className="bg-white p-4 rounded border space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <input
              className="w-full p-2 border rounded"
              value={localConfig.title ?? ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Split config title"
            />
          </div>

          {/* Board / Pipeline / Stage */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Board</Label>
              <SelectSalesBoard
                variant="form"
                value={localConfig.boardId || ''}
                onValueChange={(boardId: string) => {
                  setLocalConfig((prev) => ({
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
                boardId={localConfig.boardId || ''}
                value={localConfig.pipelineId || ''}
                disabled={!localConfig.boardId}
                onValueChange={(pipelineId: string) => {
                  setLocalConfig((prev) => ({
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
                id="split-stage"
                variant="form"
                pipelineId={localConfig.pipelineId || ''}
                value={localConfig.stageId || ''}
                disabled={!localConfig.pipelineId}
                onValueChange={(stageId: string) =>
                  updateField('stageId', stageId)
                }
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white p-4 rounded border space-y-4">
          <h3 className="font-medium">Category Filters</h3>

          <div className="space-y-2">
            <Label>Include Categories</Label>
            <SelectProductCategories
              value={localConfig.productCategoryIds ?? []}
              onChange={(ids) => updateField('productCategoryIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label>Exclude Categories</Label>
            <SelectProductCategories
              value={localConfig.excludeCategoryIds ?? []}
              onChange={(ids) => updateField('excludeCategoryIds', ids)}
            />
          </div>
        </div>

        {/* Tag Filters */}
        <div className="bg-white p-4 rounded border space-y-4">
          <h3 className="font-medium">Tag Filters</h3>

          <div className="space-y-2">
            <Label>Include Tags</Label>
            <SelectProductTags
              value={localConfig.productTagIds ?? []}
              onChange={(ids) => updateField('productTagIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label>Exclude Tags</Label>
            <SelectProductTags
              value={localConfig.excludeTagIds ?? []}
              onChange={(ids) => updateField('excludeTagIds', ids)}
            />
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-4 rounded border space-y-4">
          <h3 className="font-medium">Products</h3>

          <div className="space-y-2">
            <Label>Exclude Products</Label>
            <SelectProducts
              value={localConfig.excludeProductIds ?? []}
              onChange={(ids) => updateField('excludeProductIds', ids)}
            />
          </div>
        </div>

        {/* Segments */}
        <div className="bg-white p-4 rounded border space-y-4">
          <h3 className="font-medium">Segments</h3>

          <div className="space-y-2">
            <Label>Segment</Label>
            <SelectSegments
              contentTypes={['core:product']}
              value={getSingle(localConfig.segmentIds)}
              onChange={(id) => updateField('segmentIds', toSingleArray(id))}
            />
          </div>
        </div>

        {/* Limits */}
        <div className="bg-white p-4 rounded border space-y-4">
          <h3 className="font-medium">Limits</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Low Count</Label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={localConfig.ltCount ?? ''}
                onChange={(e) =>
                  updateField(
                    'ltCount',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Great Count</Label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={localConfig.gtCount ?? ''}
                onChange={(e) =>
                  updateField(
                    'gtCount',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Low Unit Price</Label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={localConfig.ltUnitPrice ?? ''}
                onChange={(e) =>
                  updateField(
                    'ltUnitPrice',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Great Unit Price</Label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={localConfig.gtUnitPrice ?? ''}
                onChange={(e) =>
                  updateField(
                    'gtUnitPrice',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </div>

            {/* Sub UOM Type */}
            <div className="space-y-1 col-span-2">
              <Label>Sub uom type</Label>

              <Select
                value={localConfig.subUomType ?? ''}
                onValueChange={(v) =>
                  updateField(
                    'subUomType',
                    v === CLEAR_VALUE ? undefined : (v as any),
                  )
                }
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Not use" />
                </Select.Trigger>

                <Select.Content>
                  <Select.Item value={CLEAR_VALUE}>Not use</Select.Item>
                  <Select.Item value="lt">Low than count</Select.Item>
                  <Select.Item value="gte">
                    Greater, equal than count
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete Config
          </Button>

          <Button type="button" variant="default" onClick={handleSave}>
            Save Config
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default SplitConfig;
