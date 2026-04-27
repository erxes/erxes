import { useMutation, useQuery } from '@apollo/client';
import { Button, Label } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import { SelectPipeline } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectSalesBoard } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectStage } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
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

interface MnConfig {
  _id: string;
  subId?: string;
  value: { key: string; value: any }[];
}

interface MnConfigsQueryResponse {
  mnConfigs: MnConfig[];
}

// ---------- Defaults ----------
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

  const { data, loading: queryLoading } = useQuery<MnConfigsQueryResponse>(
    MN_CONFIGS,
    {
      variables: { code: 'dealsProductsDataPrint' },
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

  if (queryLoading && savedConfigs.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        {/* ✅ HEADER (reused) */}
        <ConfigHeader
          title="Print Configuration"
          onNew={() => setActiveIndex(null)}
          disabled={loading}
        />

        {/* ✅ SAVED CONFIGS (reused) */}
        <SavedConfigsList
          configs={savedConfigs}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        {/* FORM */}
        <div className="bg-white border p-6 space-y-4">
          <Label className="text-sm font-medium">Title</Label>
          <input
            className="w-full border px-3 py-2"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <Label className="text-sm font-medium">Board</Label>
          <SelectSalesBoard
            variant="form"
            value={formData.boardId || ''}
            onValueChange={handleBoardChange}
          />

          <Label className="text-sm font-medium">Pipeline</Label>
          <SelectPipeline
            variant="form"
            boardId={formData.boardId || ''}
            value={formData.pipelineId || ''}
            onValueChange={handlePipelineChange}
          />

          <Label className="text-sm font-medium">Stage</Label>
          <SelectStage
            id="print-stage"
            variant="form"
            pipelineId={formData.pipelineId || ''}
            value={formData.stageId || ''}
            onValueChange={(v) => updateField('stageId', v)}
          />
        </div>

        {/* CONDITIONS */}
        <div className="bg-white border p-6 space-y-4">
          <Button onClick={addCondition}>+ Add condition</Button>

          {formData.conditions.map((c) => (
            <PerPrintConditions
              key={c.id}
              condition={c}
              onChange={updateCondition}
              onRemove={removeCondition}
            />
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
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

export default PrintConfig;
