import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button } from 'erxes-ui';
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
import ConfigHeader from './shared/ConfigHeader';
import SavedConfigsList from './shared/SavedConfigsList';

// ---------- Types ----------
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

  const { data, loading: queryLoading } = useQuery<MnConfigsQueryResponse>(
    MN_CONFIGS,
    {
      variables: { code: 'dealsProductsDataPlaces' },
      fetchPolicy: 'network-only',
    },
  );

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

  if (queryLoading && savedConfigs.length === 0) return <div>Loading...</div>;

  return (
    <div className="w-full flex justify-center overflow-y-auto">
      <div className="w-full max-w-5xl px-6 py-6 space-y-8">
        {/* ✅ REPLACED HEADER */}
        <ConfigHeader
          title="Product Places Config"
          onNew={handleNewConfig}
          disabled={loading}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* ✅ REPLACED SAVED LIST */}
        <SavedConfigsList
          configs={savedConfigs}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        {/* FORM */}
        <div className="border rounded-xl p-6 bg-white space-y-6">
          <label className="text-sm font-medium">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <div className="grid grid-cols-3 gap-4">
            <SelectSalesBoard
              variant="form"
              value={formData.boardId}
              onValueChange={handleBoardChange}
            />
            <SelectPipeline
              variant="form"
              boardId={formData.boardId}
              value={formData.pipelineId}
              onValueChange={handlePipelineChange}
            />
            <SelectStage
              id="place-stage"
              variant="form"
              pipelineId={formData.pipelineId}
              value={formData.stageId}
              onValueChange={(v) => updateField('stageId', v)}
            />
          </div>
        </div>

        {/* CONDITIONS */}
        <div className="border rounded-xl p-6 bg-white space-y-4">
          <Button onClick={addCondition}>+ Add condition</Button>

          {formData.conditions.map((c) => (
            <PerConditions
              key={c.id}
              condition={c}
              onChange={updateCondition}
              onRemove={deleteCondition}
            />
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          {activeIndex !== null && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button onClick={handleSave}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceConfig;
