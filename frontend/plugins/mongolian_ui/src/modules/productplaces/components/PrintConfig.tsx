import { useMutation, useQuery } from '@apollo/client';
import { Button, Input, Label, useToast, Card } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import { SelectPipeline } from '../selects/SelectPipeline';
import { SelectSalesBoard } from '../selects/SelectSalesBoard';
import { SelectStage } from '../selects/SelectStage';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_REMOVE,
  MN_CONFIGS_UPDATE,
} from '../graphql/clientMutations';
import { MN_CONFIGS } from '../graphql/clientQueries';
import { Condition } from '../types';
import {
  keyValueArrayToObject,
  objectToKeyValueArray,
} from '../utils/transformers';
import PerPrintConditions from './PerPrintConditions';
import ConfigHeader from './shared/ConfigHeader';
import SavedConfigsList from './shared/SavedConfigsList';

export interface PrintConfigData {
  _id?: string;
  subId?: string;
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  conditions: Condition[];
}

interface MnConfig {
  _id: string;
  subId?: string;
  value: { key: string; value: any }[];
}

interface MnConfigsQueryResponse {
  mnConfigs: MnConfig[];
}

const emptyForm: PrintConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  conditions: [],
};

const PrintConfig: React.FC = () => {
  const { toast } = useToast();
  const [savedConfigs, setSavedConfigs] = useState<PrintConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PrintConfigData>(emptyForm);
  const [loading, setLoading] = useState(false);

  const { data } = useQuery<MnConfigsQueryResponse>(MN_CONFIGS, {
    variables: { code: 'dealsProductsDataPrint' },
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
        ...keyValueArrayToObject(cfg.value),
      }));
      setSavedConfigs(transformed as PrintConfigData[]);
    }
  }, [data]);

  useEffect(() => {
    if (activeIndex === null) {
      setFormData(emptyForm);
    } else {
      setFormData(savedConfigs[activeIndex] ?? emptyForm);
    }
  }, [activeIndex, savedConfigs]);

  const updateField = useCallback((key: keyof PrintConfigData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

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
          id: nanoid(),
          branchId: '',
          departmentId: '',
        },
      ],
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
            code: 'dealsProductsDataPrint',
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

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 space-y-8">
        <ConfigHeader
          title="Print Configuration"
          onNew={() => setActiveIndex(null)}
          disabled={loading}
        />

        <SavedConfigsList
          configs={savedConfigs}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        <Card>
          <Card.Content className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Title
              </Label>
              <Input
                placeholder="Enter configuration title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Board
                </Label>
                <SelectSalesBoard
                  variant="form"
                  value={formData.boardId || ''}
                  onValueChange={handleBoardChange}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Pipeline
                </Label>
                <SelectPipeline
                  variant="form"
                  boardId={formData.boardId || ''}
                  value={formData.pipelineId || ''}
                  onValueChange={handlePipelineChange}
                  disabled={!formData.boardId}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Stage
                </Label>
                <SelectStage
                  id="print-stage"
                  variant="form"
                  pipelineId={formData.pipelineId || ''}
                  value={formData.stageId || ''}
                  onValueChange={(v) => updateField('stageId', v)}
                  disabled={!formData.pipelineId}
                />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Conditions ({formData.conditions.length})</Card.Title>
              <Button
                onClick={addCondition}
                variant="outline"
                className="text-xs"
              >
                + Add Condition
              </Button>
            </div>
          </Card.Header>

          <Card.Content>
            {formData.conditions.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">
                  No conditions added yet. Click "Add Condition" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.conditions.map((c, index) => (
                  <PerPrintConditions
                    key={c.id}
                    condition={c}
                    onChange={updateCondition}
                    onRemove={removeCondition}
                    onAddCondition={index === formData.conditions.length - 1 ? addCondition : undefined}
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
              onClick={() => setActiveIndex(null)}
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

export default PrintConfig;
