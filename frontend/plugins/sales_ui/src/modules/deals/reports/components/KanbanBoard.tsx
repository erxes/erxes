import React, { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useDealsByStage } from '../hooks/useDealsByStage';
import { MOVE_DEAL } from '../graphql/mutations/mutations';

interface Props {
  filters: { fromDate?: string; toDate?: string; dateRange?: string };
  pipelineId: string;
}

export const KanbanBoard: React.FC<Props> = ({ filters, pipelineId }) => {
  const { stages, loading, refetch } = useDealsByStage(filters, '-createdAt', 20, 0);
  const [moveDeal] = useMutation(MOVE_DEAL);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [draggedSourceStageId, setDraggedSourceStageId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: string, stageId: string) => {
    setDraggedDealId(dealId);
    setDraggedSourceStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStageId: string) => {
    e.preventDefault();
    if (!draggedDealId || !draggedSourceStageId || draggedSourceStageId === targetStageId) {
      setDraggedDealId(null);
      setDraggedSourceStageId(null);
      return;
    }

    try {
      await moveDeal({
        variables: {
          itemId: draggedDealId,
          destinationStageId: targetStageId,
          sourceStageId: draggedSourceStageId,
          processId: 'frontend',
        },
      });
      refetch();
    } catch (err) {
      console.error('Move deal error:', err);
    } finally {
      setDraggedDealId(null);
      setDraggedSourceStageId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading Kanban...</div>;

  return (
    <div className="flex overflow-x-auto space-x-4 p-4 bg-gray-50 rounded-lg">
      {stages.map((stage: any) => (
        <div
          key={stage.stageId}
          className="min-w-[280px] bg-white rounded-lg shadow p-4 flex-shrink-0"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage.stageId)}
        >
          <h3 className="font-semibold text-lg mb-2 flex justify-between">
            <span>{stage.stageName}</span>
            <span className="text-sm text-gray-500">{stage.totalCount}</span>
          </h3>
          <div className="space-y-2">
            {stage.deals.map((deal: any) => (
              <div
                key={deal._id}
                draggable
                onDragStart={(e) => handleDragStart(e, deal._id, stage.stageId)}
                className="bg-gray-100 p-3 rounded cursor-move hover:bg-gray-200 transition"
              >
                <div className="font-medium">{deal.name}</div>
                {deal.amount && (
                  <div className="text-sm text-gray-600">
                    Amount: {deal.amount.toLocaleString()}
                  </div>
                )}
                {deal.priority && (
                  <div className={`text-xs inline-block px-2 py-0.5 rounded ${
                    deal.priority === 'High' ? 'bg-red-100 text-red-800' :
                    deal.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {deal.priority}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};