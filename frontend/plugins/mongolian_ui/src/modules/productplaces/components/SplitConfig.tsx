import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { Button, Label } from 'erxes-ui';
import { SelectSalesBoard } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import SelectProductCategories from '../selects/SelectProductCategories';
import SelectProductTags from '../selects/SelectTags';
import SelectProducts from '../selects/SelectProducts';
import SelectSegments from '../selects/SelectSegments';
import { MN_CONFIGS } from '../graphql/clientQueries';
import { keyValueArrayToObject } from '../utils/transformers';
import ConfigHeader from './shared/ConfigHeader';
import SavedConfigsList from './shared/SavedConfigsList';

// ---------- Types ----------
export interface SplitConfigData {
  _id?: string;
  subId?: string;
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  productCategoryIds: string[];
  excludeCategoryIds: string[];
  productTagIds: string[];
  excludeTagIds: string[];
  excludeProductIds: string[];
  segmentIds: string[];
}

// Helpers
const getSingle = (arr: string[]) => arr[0] || '';
const toSingleArray = (id?: string) => (id ? [id] : []);

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
};

const SplitConfig: React.FC = () => {
  const [savedConfigs, setSavedConfigs] = useState<SplitConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<SplitConfigData>(emptyForm);

  const { data, loading } = useQuery(MN_CONFIGS, {
    variables: { code: 'dealsProductsDataSplit' },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data?.mnConfigs) {
      const transformed = data.mnConfigs.map((cfg: any) => ({
        _id: cfg._id,
        subId: cfg.subId,
        ...keyValueArrayToObject(cfg.value),
      }));
      setSavedConfigs(transformed);
    }
  }, [data]);

  useEffect(() => {
    if (activeIndex === null) {
      setFormData(emptyForm);
    } else {
      setFormData(savedConfigs[activeIndex] ?? emptyForm);
    }
  }, [activeIndex, savedConfigs]);

  const updateField = useCallback((key: keyof SplitConfigData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNew = () => {
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  if (loading && savedConfigs.length === 0) return <div>Loading...</div>;

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        <ConfigHeader title="Split Configuration" onNew={handleNew} />
        <SavedConfigsList
          configs={savedConfigs}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <Label className="text-sm font-medium">Title</Label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Board</Label>
              <SelectSalesBoard
                variant="form"
                value={formData.boardId || ''}
                onValueChange={(v) => updateField('boardId', v)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Pipeline</Label>
              <SelectPipeline
                variant="form"
                boardId={formData.boardId || ''}
                value={formData.pipelineId || ''}
                onValueChange={(v) => updateField('pipelineId', v)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Stage</Label>
              <SelectStage
                id="split-stage"
                variant="form"
                pipelineId={formData.pipelineId || ''}
                value={formData.stageId || ''}
                onValueChange={(v) => updateField('stageId', v)}
              />
            </div>
          </div>
        </div>

        {/* CATEGORY */}
        <div className="bg-white border p-6 space-y-3">
          <Label className="text-sm font-medium">Include Categories</Label>
          <SelectProductCategories
            value={formData.productCategoryIds}
            onChange={(v) => updateField('productCategoryIds', v)}
          />

          <Label className="text-sm font-medium">Exclude Categories</Label>
          <SelectProductCategories
            value={formData.excludeCategoryIds}
            onChange={(v) => updateField('excludeCategoryIds', v)}
          />
        </div>

        {/* TAGS */}
        <div className="bg-white border p-6 space-y-3">
          <Label className="text-sm font-medium">Include Tags</Label>
          <SelectProductTags
            value={formData.productTagIds}
            onChange={(v) => updateField('productTagIds', v)}
          />

          <Label className="text-sm font-medium">Exclude Tags</Label>
          <SelectProductTags
            value={formData.excludeTagIds}
            onChange={(v) => updateField('excludeTagIds', v)}
          />
        </div>

        {/* PRODUCTS */}
        <div className="bg-white border p-6 space-y-3">
          <Label className="text-sm font-medium">Exclude Products</Label>
          <SelectProducts
            value={formData.excludeProductIds}
            onChange={(v) => updateField('excludeProductIds', v)}
          />
        </div>

        {/* SEGMENT */}
        <div className="bg-white border p-6 space-y-3">
          <Label className="text-sm font-medium">Segment</Label>
          <SelectSegments
            contentTypes={['core:product']}
            value={getSingle(formData.segmentIds)}
            onChange={(id) => updateField('segmentIds', toSingleArray(id))}
          />
        </div>

        {/* ACTION */}
        <div className="flex justify-end">
          <Button>Save Config</Button>
        </div>
      </div>
    </div>
  );
};

export default SplitConfig;
