import { Button, toast, useQueryState } from 'erxes-ui';
import { IconBrandTrello, IconSettings } from '@tabler/icons-react';
import {
  KanbanBoard,
  KanbanCard,
  KanbanProvider,
} from '@/deals/components/common/kanban/KanbanContext';
import { useEffect, useState } from 'react';
import { useStages, useStagesOrder } from '@/deals/stage/hooks/useStages';

import { KanbanCards } from '@/deals/components/common/kanban/KanbanCards';
import { Link } from 'react-router-dom';
import { StageHeader } from './StageHeader';
import { StagesLoading } from '@/deals/components/loading/StagesLoading';
import { useDealsChange } from '@/deals/cards/hooks/useDeals';

export const StagesList = () => {
  const [pipelineId] = useQueryState<string>('pipelineId');

  const { stages, loading: stagesLoading } = useStages({
    variables: {
      pipelineId,
    },
  });

  const { changeDeals } = useDealsChange();
  const { updateStagesOrder } = useStagesOrder();

  const [features, setFeatures] = useState([]);
  const [columns, setColumns] = useState(stages || []);

  useEffect(() => {
    setColumns(stages || []);
  }, [stages, pipelineId]);

  const updateOrders = async (variables: any, type: string) => {
    const mutation = type === 'column' ? updateStagesOrder : changeDeals;

    try {
      await mutation({
        variables,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (stagesLoading) {
    return <StagesLoading />;
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 gap-2">
        <IconBrandTrello size={64} stroke={1.5} className="text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-600">No stages yet</h2>
        <p className="text-md text-gray-500 mb-4">
          Create a stage to start organizing your sales pipeline.
        </p>
        <Button variant="outline" asChild>
          <Link to="/settings/deals">
            <IconSettings />
            Go to settings
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-x-auto">
      <KanbanProvider
        columns={columns}
        data={features}
        onDataChange={setFeatures}
        onColumnsChange={setColumns}
        updateOrders={updateOrders}
      >
        {(column) => (
          <KanbanBoard _id={column._id} key={column._id}>
            <StageHeader stage={column} />
            <KanbanCards id={column._id}>
              {(feature) => (
                <KanbanCard
                  key={feature._id}
                  card={feature}
                  featureId={feature._id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="m-0 flex-1 font-medium text-sm">
                        {feature.name}
                      </p>
                    </div>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
};
