import { useState, useEffect } from 'react';
import { Label, Button, Select, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';
import { SelectBoardFormItem } from '../../hooks/useSelectBoard';
import { SelectPipelineFormItem } from '../../hooks/useSelectPipeline';
import { SelectStageFormItem } from '../../hooks/useSelectStage';
import { useFieldsCombined } from '../../hooks/useFieldsCombined';

interface StageProps {
  posId?: string;
}

export const Stage: React.FC<StageProps> = ({ posId }) => {
  const [boardId, setBoardId] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [mapCustomField, setMapCustomField] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const { fields, loading: fieldsLoading } = useFieldsCombined({
    contentType: 'sales:deal',
  });

  useEffect(() => {
    if (posDetail?.deliveryConfig) {
      setBoardId(posDetail.deliveryConfig.boardId || '');
      setPipelineId(posDetail.deliveryConfig.pipelineId || '');
      setStageId(posDetail.deliveryConfig.stageId || '');
      setMapCustomField(posDetail.deliveryConfig.mapCustomField || '');
    }
  }, [posDetail]);

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
      const currentConfig = posDetail?.deliveryConfig || {};
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
