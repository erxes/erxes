import { useTriggersActions } from '@/automations/hooks/useTriggersActions';
import {
  generateEdges,
  generateNodes,
} from '@/automations/utils/automationBuilderUtils';
import { useReactFlow } from '@xyflow/react';

export const useResetNodes = () => {
  const { getNodes, setNodes, setEdges } = useReactFlow();
  const { triggers, actions } = useTriggersActions();

  const resetNodes = () => {
    const updatedNodes = generateNodes(triggers, actions);

    const mergedArray = updatedNodes.map((node1) => {
      let node2 = getNodes().find((o) => o.id === node1.id);

      if (node2) {
        return {
          ...node1,
          data: { ...node2.data, ...node1.data },
          position: { ...node1.position, ...node2.position },
        };
      }
      return node1;
    });
    setNodes(mergedArray);
    const generatedEdges = generateEdges(triggers, actions);
    setEdges(generatedEdges);
  };

  return { resetNodes };
};
