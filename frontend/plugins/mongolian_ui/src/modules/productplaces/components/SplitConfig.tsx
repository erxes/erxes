import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Input, Label, useToast } from 'erxes-ui';
import { SelectSalesBoard } from '../selects/SelectSalesBoard';
import { SelectPipeline } from '../selects/SelectPipeline';
import { SelectStage } from '../selects/SelectStage';
import SelectProductCategories from '../selects/SelectProductCategories';
import SelectProductTags from '../selects/SelectProductTags';
import SelectProducts from '../selects/SelectProducts';
import SelectSegments from '../selects/SelectSegments';
import { MN_CONFIGS } from '../graphql/clientQueries';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE,
} from '../graphql/clientMutations';
import { keyValueArrayToObject, objectToKeyValueArray } from '../utils/transformers';
import ConfigHeader from './shared/ConfigHeader';
import SavedConfigsList from './shared/SavedConfigsList';

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
  const { toast } = useToast();
  const [savedConfigs, setSavedConfigs] = useState<SplitConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<SplitConfigData>(emptyForm);
  const [loading, setLoading] = useState(false);

  const { data } = useQuery(MN_CONFIGS, {
    variables: { code: 'dealsProductsDataSplit' },
    fetchPolicy: 'network-only',
  });

  const [createConfig] = useMutation(MN_CONFIGS_CREATE);
  const [updateConfig] = useMutation(MN_CONFIGS_UPDATE);
  const [deleteConfig] = useMutation(MN_CONFIGS_REMOVE);

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

  const handleSave = async () => {
    setLoading(true);
    try {
      const { _id, ...rest } = formData;
      const valueArray = objectToKeyValueArray(rest);

      if (_id) {
        await updateConfig({ variables: { _id, value: valueArray } });
        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
          variant: 'default',
        });
      } else {
        await createConfig({
          variables: {
            code: 'dealsProductsDataSplit',
            subId: rest.stageId,
            value: valueArray,
          },
        });
        toast({
          title: 'Success',
          description: 'Configuration created successfully',
          variant: 'default',
        });
      }

      setActiveIndex(null);
      setFormData(emptyForm);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (activeIndex === null) return;
    const config = savedConfigs[activeIndex];
    if (!config._id) return;

    setLoading(true);
    try {
      await deleteConfig({ variables: { _id: config._id } });
      toast({
        title: 'Success',
        description: 'Configuration deleted successfully',
        variant: 'default',
      });
      setActiveIndex(null);
      setFormData(emptyForm);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        <ConfigHeader title="Split Configuration" onNew={handleNew} />
        <SavedConfigsList
          configs={savedConfigs}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Title</Label>
            <Input
              placeholder="Enter configuration title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Board</Label>
              <SelectSalesBoard
                variant="form"
                value={formData.boardId || ''}
                onValueChange={(v) => updateField('boardId', v)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Pipeline</Label>
              <SelectPipeline
                variant="form"
                boardId={formData.boardId || ''}
                value={formData.pipelineId || ''}
                onValueChange={(v) => updateField('pipelineId', v)}
              />
            </div>

            <div className="flex flex-col gap-2">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">
                  Include Categories
                </Label>
                <SelectProductCategories
                  value={formData.productCategoryIds ?? []}
                  onValueChange={(ids) =>
                    updateField('productCategoryIds', ids)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">
                  Exclude Categories
                </Label>
                <SelectProductCategories
                  value={formData.excludeCategoryIds}
                  onValueChange={(v) => updateField('excludeCategoryIds', v)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Include Tags</Label>
                <SelectProductTags
                  value={formData.productTagIds}
                  onValueChange={(v) => updateField('productTagIds', v)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Exclude Tags</Label>
                <SelectProductTags
                  value={formData.excludeTagIds}
                  onValueChange={(v) => updateField('excludeTagIds', v)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Exclude Products</Label>
                <SelectProducts
                  value={formData.excludeProductIds}
                  onValueChange={(v) => updateField('excludeProductIds', v)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Segment</Label>
                <SelectSegments
                  contentTypes={['core:product']}
                  value={getSingle(formData.segmentIds)}
                  onValueChange={(id) =>
                    updateField('segmentIds', toSingleArray(id))
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between py-6 border-t">
          {activeIndex !== null && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="text-xs"
            >
              Delete Config
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              onClick={handleNew}
              disabled={loading}
              className="text-xs"
            >
              Clear
            </Button>
            <Button onClick={handleSave} disabled={loading} className="text-xs">
              {loading ? 'Saving...' : 'Save Config'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitConfig;
