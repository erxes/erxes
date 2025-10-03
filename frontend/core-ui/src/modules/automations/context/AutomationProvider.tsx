import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import {
  AutomationBuilderTabsType,
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
import {
  IAutomationsActionConfigConstants,
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

interface AutomationContextType {
  awaitingToConnectNodeId?: string;
  setAwaitingToConnectNodeId: Dispatch<SetStateAction<string>>;
  queryParams: QueryValues<AutomationQueryParams>;
  setQueryParams: (values: QueryValues<AutomationQueryParams>) => void;
  triggersConst: IAutomationsTriggerConfigConstants[];
  actionsConst: IAutomationsActionConfigConstants[];
  loading: boolean;
  error: any;
  refetch: () => void;
  clear: () => void;
  reactFlowInstance: ReactFlowInstance<Node<NodeData>, Edge<EdgeProps>> | null;
  setReactFlowInstance: OnInit<Node<NodeData>, Edge<EdgeProps>>;
}

const AutomationContext = createContext<AutomationContextType | null>(null);

export const AutomationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [awaitingToConnectNodeId, setAwaitingToConnectNodeId] = useState('');
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

  const [cached, setCached] = useState<{
    triggersConst: any[];
    actionsConst: any[];
  } | null>(null);

  const { data, loading, error, refetch } = useQuery<ConstantsQueryResponse>(
    AUTOMATION_CONSTANTS,
    {
      skip: !!cached, // Skip query if cached
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-only',
    },
  );

  const triggersConst =
    cached?.triggersConst || data?.automationConstants?.triggersConst || [];
  const actionsConst =
    cached?.actionsConst || data?.automationConstants?.actionsConst || [];

  useEffect(() => {
    if (data?.automationConstants && !cached) {
      setCached({
        triggersConst: data.automationConstants.triggersConst || [],
        actionsConst: data.automationConstants.actionsConst || [],
      });
    }
  }, [data, cached]);

  const clear = () => setCached(null);

  return (
    <AutomationContext.Provider
      value={{
        awaitingToConnectNodeId,
        setAwaitingToConnectNodeId,
        queryParams,
        setQueryParams,
        triggersConst,
        actionsConst,
        loading: !cached && loading,
        error,
        refetch,
        clear,
        reactFlowInstance,
        setReactFlowInstance,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};

export const useAutomation = () => {
  const ctx = useContext(AutomationContext);
  if (!ctx)
    throw new Error('useAutomation must be used within AutomationProvider');
  return ctx;
};
