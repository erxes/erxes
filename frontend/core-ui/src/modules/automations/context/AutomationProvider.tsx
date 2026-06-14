import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import {
  AutomationBuilderTabsType,
  AutomationConstants,
  AutomationNodeType,
  ConstantsQueryResponse,
  NodeData,
} from '@/automations/types';
import { useQuery } from '@apollo/client';
import {
  Edge,
  EdgeProps,
  Node,
  OnInit,
  ReactFlowInstance,
} from '@xyflow/react';
import { useMultiQueryState } from 'erxes-ui';
import {
  createContext,
  SetStateAction,
  Dispatch,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  IAutomationsActionConfigConstants,
  IAutomationsActionFolkConfig,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';

type QueryTypes = Record<string, unknown>;

type QueryValues<T extends QueryTypes> = {
  [K in keyof T]: T[K] | null;
};

type AutomationQueryParams = {
  activeTab?: AutomationBuilderTabsType;
  activeNodeId?: string;
  activeNodeTab?: AutomationNodeType;
};

type TAutomationSelectedNode = {
  id: string;
  type: string;
  nodeType: AutomationNodeType;
  label: string;
  icon?: string;
} | null;

type TConstantCachedFields =
  | 'triggersConst'
  | 'actionsConst'
  | 'findObjectTargetsConst';

type TConstantCached = Pick<AutomationConstants, TConstantCachedFields> | null;
interface AutomationContextType {
  awaitingToConnectNodeId?: string;
  setAwaitingToConnectNodeId: Dispatch<SetStateAction<string>>;
  selectedNode: TAutomationSelectedNode;
  setSelectedNode: Dispatch<SetStateAction<TAutomationSelectedNode>>;
  queryParams: QueryValues<AutomationQueryParams>;
  setQueryParams: (values: QueryValues<AutomationQueryParams>) => void;
  triggersConst: IAutomationsTriggerConfigConstants[];
  actionsConst: IAutomationsActionConfigConstants[];
  findObjectTargetsConst: any[];
  actionFolks: Record<string, IAutomationsActionFolkConfig[]>;
  loading: boolean;
  error: any;
  refetch: () => void;
  clear: () => void;
  reactFlowInstance: ReactFlowInstance<Node<NodeData>, Edge<EdgeProps>> | null;
  setReactFlowInstance: OnInit<Node<NodeData>, Edge<EdgeProps>>;
  actionConstMap: Map<string, IAutomationsActionConfigConstants>;
  triggerConstMap: Map<string, IAutomationsTriggerConfigConstants>;
  isCreatePage: boolean;
}

const AutomationContext = createContext<AutomationContextType | null>(null);

export const AutomationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [awaitingToConnectNodeId, setAwaitingToConnectNodeId] = useState('');
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    type: string;
    nodeType: AutomationNodeType;
    label: string;
    icon?: string;
  } | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    Node<NodeData>,
    Edge<EdgeProps>
  > | null>(null);
  const [queryParams, setQueryParams] =
    useMultiQueryState<AutomationQueryParams>([
      'activeTab',
      'activeNodeTab',
      'activeNodeId',
    ]);
  const { pathname } = useLocation();
  const isCreatePage = pathname === '/automations/create';
  const [cached, setCached] = useState<TConstantCached>(null);

  const { data, loading, error, refetch } = useQuery<ConstantsQueryResponse>(
    AUTOMATION_CONSTANTS,
    {
      skip: !!cached, // Skip query if cached
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-only',
    },
  );

  const triggersConst = getAutomationConstantsVariables(
    'triggersConst',
    cached,
    data,
  );
  const actionsConst = getAutomationConstantsVariables(
    'actionsConst',
    cached,
    data,
  );
  const findObjectTargetsConst = getAutomationConstantsVariables(
    'findObjectTargetsConst',
    cached,
    data,
  );

  const actionFolks = Object.fromEntries(
    (actionsConst || []).map((a: any) => [a.type, a.folks || []]),
  );

  const actionConstMap = new Map<string, IAutomationsActionConfigConstants>(
    actionsConst.map((a) => [a.type, a]),
  );
  const triggerConstMap = new Map<string, IAutomationsTriggerConfigConstants>(
    triggersConst.map((t) => [t.type, t]),
  );

  useEffect(() => {
    if (data?.automationConstants && !cached) {
      setCached({
        triggersConst: data.automationConstants.triggersConst || [],
        actionsConst: data.automationConstants.actionsConst || [],
        findObjectTargetsConst:
          data.automationConstants.findObjectTargetsConst || [],
      });
    }
  }, [data, cached]);

  useEffect(() => {
    if (!queryParams.activeNodeId || !reactFlowInstance) {
      setSelectedNode(null);
      return;
    }

    const activeNode = reactFlowInstance.getNode(queryParams.activeNodeId);

    if (!activeNode?.data?.type) {
      setSelectedNode(null);
      return;
    }

    setSelectedNode({
      id: activeNode.id,
      type: activeNode.data.type,
      nodeType: activeNode.data.nodeType,
      label: activeNode.data.label,
      icon: activeNode.data.icon,
    });
  }, [queryParams.activeNodeId, reactFlowInstance]);

  const clear = () => setCached(null);

  return (
    <AutomationContext.Provider
      value={{
        awaitingToConnectNodeId,
        setAwaitingToConnectNodeId,
        selectedNode,
        setSelectedNode,
        queryParams,
        setQueryParams,
        triggersConst,
        actionsConst,
        findObjectTargetsConst,
        actionFolks,
        loading: !cached && loading,
        error,
        refetch,
        clear,
        reactFlowInstance,
        setReactFlowInstance,
        actionConstMap,
        triggerConstMap,
        isCreatePage,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};

const getAutomationConstantsVariables = <TKey extends TConstantCachedFields>(
  key: TKey,
  cached: TConstantCached,
  data?: ConstantsQueryResponse,
): AutomationConstants[TKey] => {
  if (cached?.[key]) {
    return cached[key] as AutomationConstants[TKey];
  }

  const automationConstants = data?.automationConstants;

  if (automationConstants?.[key]) {
    return automationConstants[key] as AutomationConstants[TKey];
  }

  return [] as AutomationConstants[TKey];
};

export const useAutomation = () => {
  const ctx = useContext(AutomationContext);
  if (!ctx)
    throw new Error('useAutomation must be used within AutomationProvider');
  return ctx;
};
