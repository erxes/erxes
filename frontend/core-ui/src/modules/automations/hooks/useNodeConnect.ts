import { useAutomation } from '@/automations/context/AutomationProvider';
import { useTriggersActions } from '@/automations/hooks/useTriggersActions';
import { NodeData } from '@/automations/types';
import {
  checkIsValidConnect,
  connectionHandler,
  generateConnect,
} from '@/automations/utils/automationConnectionUtils';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { addEdge, Connection, Node, useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

export const useNodeConnect = () => {
  const { triggers, actions } = useTriggersActions();
  const { setValue } = useFormContext<TAutomationBuilderForm>();
  const { getNodes, getEdges, getNode, setEdges } =
    useReactFlow<Node<NodeData>>();

  const nodes = getNodes();
  const edges = getEdges();

  const { triggersConst, actionsConst } = useAutomation();
  const onConnection = (info: any) => {
    const { triggers: updatedTriggers, actions: updatedActions } =
      connectionHandler(triggers, actions, info, info.targetId, []);
    setValue('triggers', updatedTriggers);
    setValue(
      'actions',
      updatedActions.map((action) => ({
        ...action,
        config: action.config || {},
      })),
    );
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const source = getNode(params.source);
      setEdges((eds) => {
        const updatedEdges = addEdge({ ...params }, eds);

        onConnection(generateConnect(params, source));

        return updatedEdges;
      });
    },
    [nodes],
  );

  const isValidConnection = useCallback(
    (connection: Connection) =>
      checkIsValidConnect({
        nodes,
        edges,
        connection,
        triggersConst,
        actionsConst,
      }),
    [nodes, edges],
  );

  return {
    isValidConnection,
    onConnect,
    onConnection,
  };
};
