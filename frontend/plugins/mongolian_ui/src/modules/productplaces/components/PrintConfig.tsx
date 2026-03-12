import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Label } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { PerPrintConfig, Condition } from '../types';
import PerPrintConditions from './PerPrintConditions';
import { SelectSalesBoard } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import { MN_CONFIGS } from '../graphql/clientQueries';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE,
} from '../graphql/clientMutations';
import {
  objectToKeyValueArray,
  keyValueArrayToObject,
} from '../utils/transformers';

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

// GraphQL response types
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

interface MnConfigCreateMutationResponse {
  mnConfigsCreate: MnConfig;
}

interface MnConfigUpdateMutationResponse {
  mnConfigsUpdate: MnConfig;
}

interface MnConfigRemoveMutationResponse {
  mnConfigsRemove: MnConfig;
}

// ---------- Component ----------
const emptyForm: PrintConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  conditions: [],
};

const PrintConfig: React.FC = () => {
  const [savedConfigs, setSavedConfigs] = useState<PrintConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PrintConfigData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GraphQL hooks with proper typing
  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery<MnConfigsQueryResponse>(MN_CONFIGS, {
    variables: { code: 'dealsProductsDataPrint' },
    fetchPolicy: 'network-only',
  });

  const [createConfig] = useMutation<MnConfigCreateMutationResponse>(
    MN_CONFIGS_CREATE,
    {
      update(cache, { data }) {
        if (!data) return;
        const existing = cache.readQuery<MnConfigsQueryResponse>({
          query: MN_CONFIGS,
          variables: { code: 'dealsProductsDataPrint' },
        });
        if (existing?.mnConfigs) {
          cache.writeQuery<MnConfigsQueryResponse>({
            query: MN_CONFIGS,
            variables: { code: 'dealsProductsDataPrint' },
            data: {
              mnConfigs: [...existing.mnConfigs, data.mnConfigsCreate],
            },
          });
        }
      },
    },
  );

  const [updateConfig] = useMutation<MnConfigUpdateMutationResponse>(
    MN_CONFIGS_UPDATE,
    {
      update(cache, { data }) {
        if (!data) return;
        const existing = cache.readQuery<MnConfigsQueryResponse>({
          query: MN_CONFIGS,
          variables: { code: 'dealsProductsDataPrint' },
        });
        if (existing?.mnConfigs) {
          cache.writeQuery<MnConfigsQueryResponse>({
            query: MN_CONFIGS,
            variables: { code: 'dealsProductsDataPrint' },
            data: {
              mnConfigs: existing.mnConfigs.map((cfg) =>
                cfg._id === data.mnConfigsUpdate._id
                  ? data.mnConfigsUpdate
                  : cfg,
              ),
            },
          });
        }
      },
    },
  );

  const [deleteConfig] = useMutation<MnConfigRemoveMutationResponse>(
    MN_CONFIGS_REMOVE,
    {
      update(cache, { data }) {
        if (!data) return;
        const existing = cache.readQuery<MnConfigsQueryResponse>({
          query: MN_CONFIGS,
          variables: { code: 'dealsProductsDataPrint' },
        });
        if (existing?.mnConfigs) {
          cache.writeQuery<MnConfigsQueryResponse>({
            query: MN_CONFIGS,
            variables: { code: 'dealsProductsDataPrint' },
            data: {
              mnConfigs: existing.mnConfigs.filter(
                (cfg) => cfg._id !== data.mnConfigsRemove._id,
              ),
            },
          });
        }
      },
    },
  );

  // Load configs from backend into local state
  useEffect(() => {
    if (data?.mnConfigs) {
      const transformed = data.mnConfigs.map((cfg) => {
        const obj = keyValueArrayToObject<Partial<PrintConfigData>>(cfg.value);
        return {
          _id: cfg._id,
          subId: cfg.subId,
          ...obj,
        } as PrintConfigData;
      });
      setSavedConfigs(transformed);
    }
  }, [data]);

  // Sync form with active config
  useEffect(() => {
    if (activeIndex !== null) {
      setFormData(savedConfigs[activeIndex] ?? emptyForm);
    } else {
      setFormData(emptyForm);
    }
  }, [activeIndex, savedConfigs]);

  const updateField = useCallback(
    <K extends keyof PrintConfigData>(key: K, value: PrintConfigData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Centralized selection change handlers
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
    const condition: Condition = {
      id: nanoid(),
      branchId: '',
      departmentId: '',
    };
    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, condition],
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
    setError(null);
    try {
      const { _id, subId, ...rest } = formData;
      const valueArray = objectToKeyValueArray(rest);
      if (_id) {
        await updateConfig({ variables: { _id, value: valueArray } });
      } else {
        await createConfig({
          variables: {
            code: 'dealsProductsDataPrint',
            subId: rest.stageId,
            value: valueArray,
          },
        });
      }
      setActiveIndex(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error('Save failed', error);
      setError('Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (activeIndex === null) return;
    if (!window.confirm('Delete this print config?')) return;
    const config = savedConfigs[activeIndex];
    if (!config._id) return;
    setLoading(true);
    setError(null);
    try {
      await deleteConfig({ variables: { _id: config._id } });
      setActiveIndex(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error('Delete failed', error);
      setError('Delete failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConfig = () => {
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  if (queryLoading && savedConfigs.length === 0) return <div>Loading...</div>;

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Print Configuration</h2>
          <Button
            variant="outline"
            onClick={handleNewConfig}
            disabled={loading}
          >
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

        {/* FORM CARD */}
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Board, Pipeline, Stage */}
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
                onValueChange={(stageId: string) =>
                  updateField('stageId', stageId)
                }
              />
            </div>
          </div>
        </div>

        {/* CONDITIONS */}
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Print Conditions
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCondition}
              disabled={loading}
            >
              + Add condition
            </Button>
          </div>
          {formData.conditions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No conditions added
            </div>
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
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrintConfig;
