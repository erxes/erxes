type WorkflowConnection = {
  sourceId: string;
  targetId: string;
};

type OptionalConnect = {
  sourceId: string;
  actionId: string;
  optionalConnectId: string;
};

type IConfig = {
  workflowConnection?: WorkflowConnection;
  optionalConnect?: OptionalConnect[];
  [key: string]: any;
};

export type IAction = {
  id: string;
  type: string;
  icon?: string;
  label?: string;
  description?: string;
  nextActionId?: string;
  isAvailable?: boolean;
  style?: any;
  config?: IConfig;
  position?: any;
  isAvailableOptionalConnect?: boolean;
  workflowId?: string;

  count?: number;
};
