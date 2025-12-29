import { useState, useEffect } from 'react';
import { Label, Button, Select, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import { SelectBoardFormItem } from '@/pos/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pos/hooks/useSelectPipeline';
import { SelectStageFormItem } from '@/pos/hooks/useSelectStage';
import { useFieldsCombined } from '@/pos/hooks/useFieldsCombined';
import { cleanData } from '@/pos/utils/cleanData';

interface StageProps {
  posId?: string;
}

export const Stage: React.FC<StageProps> = ({ posId }) => {
  const [boardId, setBoardId] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [mapCustomField, setMapCustomField] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const { fields, loading: fieldsLoading } = useFieldsCombined({
    contentType: 'sales:deal',
  });

  useEffect(() => {
    if (hasChanges) {
      return;
    }

    if (posDetail?.deliveryConfig) {
      setBoardId(posDetail.deliveryConfig.boardId || '');
      setPipelineId(posDetail.deliveryConfig.pipelineId || '');
      setStageId(posDetail.deliveryConfig.stageId || '');
      setMapCustomField(posDetail.deliveryConfig.mapCustomField || '');
    }
  }, [posDetail, hasChanges]);

  const handleBoardChange = (value: string) => {
    setBoardId(value);
    setPipelineId('');
    setStageId('');
    setHasChanges(true);
  };

  const handlePipelineChange = (value: string) => {
    setPipelineId(value);
    setStageId('');
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!posId) {
      toast({
        title: 'Error',
        description: 'POS ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const currentConfig = cleanData(posDetail?.deliveryConfig || {});
      await posEdit({
        variables: {
          _id: posId,
          deliveryConfig: {
            ...currentConfig,
            boardId,
            pipelineId,
            stageId,
            mapCustomField,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Delivery config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save delivery config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="w-24 h-4 rounded animate-pulse bg-muted" />
              <div className="h-8 rounded animate-pulse bg-muted" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="w-32 h-4 rounded animate-pulse bg-muted" />
          <div className="w-48 h-8 rounded animate-pulse bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load POS details: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>BOARD</Label>
          <SelectBoardFormItem
            value={boardId}
            onValueChange={handleBoardChange}
            placeholder="Choose a board"
          />
        </div>

        <div className="space-y-2">
          <Label>PIPELINE</Label>
          <SelectPipelineFormItem
            value={pipelineId}
            onValueChange={handlePipelineChange}
            boardId={boardId}
            placeholder="Choose a pipeline"
          />
        </div>

        <div className="space-y-2">
          <Label>STAGE</Label>
          <SelectStageFormItem
            value={stageId}
            onValueChange={(value) => {
              setStageId(value);
              setHasChanges(true);
            }}
            pipelineId={pipelineId}
            placeholder="Choose a stage"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>CHOOSE MAP FIELD</Label>
        <Select
          value={mapCustomField}
          onValueChange={(val) => {
            setMapCustomField(val);
            setHasChanges(true);
          }}
        >
          <Select.Trigger className="w-48" disabled={fieldsLoading}>
            <Select.Value
              placeholder={fieldsLoading ? 'Loading...' : 'Select field'}
            />
          </Select.Trigger>
          <Select.Content>
            {fields.map((field) => (
              <Select.Item key={field.name} value={field.name}>
                {field.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
