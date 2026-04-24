import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Input, Label } from 'erxes-ui';
import { useCallback, useEffect, useState } from 'react';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_REMOVE,
  MN_CONFIGS_UPDATE,
} from '../graphql/clientMutations';
import { MN_CONFIGS } from '../graphql/clientQueries';
import { PlaceConditionUI } from '../types';
import {
  keyValueArrayToObject,
  objectToKeyValueArray,
} from '../utils/transformers';
import PerConditions from './PerConditions';
import ConfigHeader from './shared/ConfigHeader';
import SavedConfigsList from './shared/SavedConfigsList';

export interface PlaceConfigData {
  _id?: string;
  subId?: string;
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  checkPricing: boolean;
  conditions: PlaceConditionUI[];
}

interface MnConfigValueItem {
  key: string;
  value: any;
}

interface MnConfig {
  _id: string;
  subId?: string;
  value: MnConfigValueItem[];
}

interface MnConfigsQueryResponse {
  mnConfigs: MnConfig[];
}

const emptyForm: PlaceConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  checkPricing: false,
  conditions: [],
};

const PlaceConfig: React.FC = () => {
  const [savedConfigs, setSavedConfigs] = useState<PlaceConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PlaceConfigData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery<MnConfigsQueryResponse>(MN_CONFIGS, {
    variables: { code: 'dealsProductsDataPlaces' },
    fetchPolicy: 'network-only',
  });

  const [createConfig] = useMutation(MN_CONFIGS_CREATE);
  const [updateConfig] = useMutation(MN_CONFIGS_UPDATE);
  const [deleteConfig] = useMutation(MN_CONFIGS_REMOVE);

  useEffect(() => {
    if (data?.mnConfigs) {
      const transformed = data.mnConfigs.map((cfg) => ({
        _id: cfg._id,
        subId: cfg.subId,
        ...keyValueArrayToObject<PlaceConfigData>(cfg.value),
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

  const updateField = useCallback(
    <K extends keyof PlaceConfigData>(key: K, value: PlaceConfigData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleBoardChange = (boardId: string) => {
    setFormData((prev) => ({
      ...prev,
      boardId,
      pipelineId: '',
      stageId: '',
    }));
  };

  const handlePipelineChange = (pipelineId: string) => {
    setFormData((prev) => ({
      ...prev,
      pipelineId,
      stageId: '',
    }));
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: crypto.randomUUID(),
          branchId: '',
          departmentId: '',
        },
      ],
    }));
  };

  const updateCondition = (id: string, updated: PlaceConditionUI) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? updated : c)),
    }));
  };

  const deleteCondition = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const { _id, ...rest } = formData;
      const valueArray = objectToKeyValueArray(rest);

      if (_id) {
        await updateConfig({ variables: { _id, value: valueArray } });
      } else {
        await createConfig({
          variables: {
            code: 'dealsProductsDataPlaces',
            subId: rest.stageId,
            value: valueArray,
          },
        });
      }

      setActiveIndex(null);
      setFormData(emptyForm);
    } catch {
      setError('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (activeIndex === null) return;
    const config = savedConfigs[activeIndex];
    if (!config._id) return;

    await deleteConfig({ variables: { _id: config._id } });
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  const handleNewConfig = () => {
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  return (
    <div className="w-full flex justify-center overflow-y-auto ">
      <div className="w-full max-w-6xl px-6 py-6 space-y-8">
        <ConfigHeader
          title="Product Places Config"
          onNew={handleNewConfig}
          disabled={loading}
        />
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠</span>
            <div>
              <p className="font-medium text-sm">Error</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}
        <SavedConfigsList
          configs={savedConfigs}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
        <Card>
          <Card.Content className="space-y-6">
            <div className="space-y-2 pt-4">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Title
              </Label>
              <Input
                placeholder="Enter configuration title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                  Select Board
                </Label>
                <SelectBoard
                  mode="single"
                  value={formData.boardId}
                  onValueChange={(v) => handleBoardChange(v as string)}
                  placeholder="Choose board"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                  Select Pipeline
                </Label>
                <SelectPipeline
                  mode="single"
                  boardId={formData.boardId}
                  value={formData.pipelineId}
                  onValueChange={(v) => handlePipelineChange(v as string)}
                  placeholder="Choose pipeline"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                  Select Stage
                </Label>
                <SelectStage
                  mode="single"
                  pipelineId={formData.pipelineId}
                  value={formData.stageId}
                  onValueChange={(v) => updateField('stageId', v as string)}
                  placeholder="Choose stage"
                />
              </div>
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>Conditions ({formData.conditions.length})</Card.Title>
          </Card.Header>

          <Card.Content>
            {formData.conditions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-4">
                <p className="text-sm">
                  No conditions added yet. Click "Add condition" to get started.
                </p>
                <Button
                  onClick={addCondition}
                  variant="outline"
                  className="text-xs"
                >
                  + Add condition
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.conditions.map((c, index) => (
                  <PerConditions
                    key={c.id}
                    condition={c}
                    onChange={updateCondition}
                    onRemove={deleteCondition}
                    onAddCondition={
                      index === formData.conditions.length - 1
                        ? addCondition
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
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
              onClick={handleNewConfig}
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

export default PlaceConfig;
