import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, ApolloCache } from '@apollo/client';
import { Button, Label } from 'erxes-ui';
import PerConditions from './PerConditions';
import { PlaceConditionUI } from '../types';
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
const emptyForm: PlaceConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  checkPricing: false,
  conditions: [],
};
const updateConfigsCache = (
  cache: ApolloCache<any>,
  updater: (configs: MnConfig[]) => MnConfig[],
) => {
  const existing = cache.readQuery<MnConfigsQueryResponse>({
    query: MN_CONFIGS,
    variables: { code: 'dealsProductsDataPlaces' },
  });

  if (!existing?.mnConfigs) return;

  cache.writeQuery<MnConfigsQueryResponse>({
    query: MN_CONFIGS,
    variables: { code: 'dealsProductsDataPlaces' },
    data: {
      mnConfigs: updater(existing.mnConfigs),
    },
  });
};

const PlaceConfig: React.FC = () => {
  const [savedConfigs, setSavedConfigs] = useState<PlaceConfigData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PlaceConfigData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GraphQL hooks with proper typing
  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery<MnConfigsQueryResponse>(MN_CONFIGS, {
    variables: { code: 'dealsProductsDataPlaces' },
    fetchPolicy: 'network-only',
  });

  const [createConfig] = useMutation<MnConfigCreateMutationResponse>(
    MN_CONFIGS_CREATE,
    {
      update(cache, { data }) {
        if (!data) return;
        updateConfigsCache(cache, (configs) => [
          ...configs,
          data.mnConfigsCreate,
        ]);
      },
    },
  );

  const [updateConfig] = useMutation<MnConfigUpdateMutationResponse>(
    MN_CONFIGS_UPDATE,
    {
      update(cache, { data }) {
        if (!data) return;
        updateConfigsCache(cache, (configs) =>
          configs.map((cfg) =>
            cfg._id === data.mnConfigsUpdate._id ? data.mnConfigsUpdate : cfg,
          ),
        );
      },
    },
  );

  const [deleteConfig] = useMutation<MnConfigRemoveMutationResponse>(
    MN_CONFIGS_REMOVE,
    {
      update(cache, { data }) {
        if (!data) return;
        updateConfigsCache(cache, (configs) =>
          configs.filter((cfg) => cfg._id !== data.mnConfigsRemove._id),
        );
      },
    },
  );

  // Load configs from backend into local state
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

  // Sync form with active config
  useEffect(() => {
    if (activeIndex !== null) {
      setFormData(savedConfigs[activeIndex] ?? emptyForm);
    } else {
      setFormData(emptyForm);
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
      const { _id, subId, ...rest } = formData;
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
      await refetch();
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
    if (!window.confirm('Delete this config?')) return;
    const config = savedConfigs[activeIndex];
    if (!config._id) return;
    setLoading(true);
    setError(null);
    try {
      await deleteConfig({ variables: { _id: config._id } });
      setActiveIndex(null);
      setFormData(emptyForm);
      await refetch();
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
    <div className="w-full flex justify-center overflow-y-auto">
      <div className="w-full max-w-5xl px-6 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Product Places Config</h1>
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

        {/* Saved Configs */}
        {savedConfigs.length > 0 && (
          <div className="border rounded-xl p-5 space-y-4 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Saved Configs
            </h3>
            <div className="space-y-3">
              {savedConfigs.map((cfg, i) => (
                <div
                  key={cfg._id || i}
                  onClick={() => setActiveIndex(i)}
                  className={`cursor-pointer p-4 rounded-lg border transition-all
                    ${
                      i === activeIndex
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/40'
                    }
                  `}
                >
                  <div className="font-medium">{cfg.title || '(Untitled)'}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Stage: {cfg.stageId || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="border rounded-xl p-6 bg-white shadow-sm space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <input
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectSalesBoard
              variant="form"
              value={formData.boardId}
              onValueChange={handleBoardChange}
              disabled={loading}
            />
            <SelectPipeline
              variant="form"
              boardId={formData.boardId}
              value={formData.pipelineId}
              disabled={!formData.boardId || loading}
              onValueChange={handlePipelineChange}
            />
            <SelectStage
              id="place-stage"
              variant="form"
              pipelineId={formData.pipelineId}
              value={formData.stageId}
              disabled={!formData.pipelineId || loading}
              onValueChange={(stageId) => updateField('stageId', stageId)}
            />
          </div>
        </div>

        {/* Conditions Section */}
        <div className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Conditions
            </h3>
            <Button variant="outline" onClick={addCondition} disabled={loading}>
              + Add condition
            </Button>
          </div>
          <div className="space-y-4">
            {formData.conditions.map((c) => (
              <PerConditions
                key={c.id}
                condition={c}
                onChange={updateCondition}
                onRemove={deleteCondition}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {activeIndex !== null && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Config
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Config'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceConfig;
