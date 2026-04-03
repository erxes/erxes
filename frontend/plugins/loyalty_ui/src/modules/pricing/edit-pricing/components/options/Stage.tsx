import { useState, useEffect } from 'react';
import { Button, Label, useToast } from 'erxes-ui';
import { IPricingPlanDetail } from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { SelectBoardFormItem } from '@/pricing/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pricing/hooks/useSelectPipeline';
import { SelectStageFormItem } from '@/pricing/hooks/useSelectStage';

interface StageProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export const Stage = ({ pricingId, pricingDetail }: StageProps) => {
  const [boardId, setBoardId] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  useEffect(() => {
    if (pricingDetail) {
      setBoardId(pricingDetail.boardId || '');
      setPipelineId(pricingDetail.pipelineId || '');
      setStageId(pricingDetail.stageId || '');
      setHasChanges(false);
      setInitialLoaded(true);
    }
  }, [pricingDetail]);

  const handleBoardChange = (value: string) => {
    setBoardId(value);
    setPipelineId('');
    setStageId('');
    if (initialLoaded) setHasChanges(true);
  };

  const handlePipelineChange = (value: string) => {
    setPipelineId(value);
    setStageId('');
    if (initialLoaded) setHasChanges(true);
  };

  const handleStageChange = (value: string) => {
    setStageId(value);
    if (initialLoaded) setHasChanges(true);
  };

  const handleSave = async () => {
    if (!pricingId) return;

    try {
      await editPricing({
        _id: pricingId,
        boardId: boardId || undefined,
        pipelineId: pipelineId || undefined,
        stageId: stageId || undefined,
      });
      toast({
        title: 'Stage updated',
        description: 'Changes have been saved successfully.',
      });
    } catch {
      toast({
        title: 'Failed to update stage',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

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
            onValueChange={handleStageChange}
            pipelineId={pipelineId}
            placeholder="Choose a stage"
          />
        </div>
      </div>

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={loading}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};
