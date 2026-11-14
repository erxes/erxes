import {
  IAutomationsActionConfigConstants,
  IAutomationsActionFolkConfig,
} from 'ui-modules';

// Written by the engine's error policy; mirrors AUTOMATION_BRANCH_KEYS.
export const BRANCH_SUCCESS_KEY = 'onSuccessActionId';
export const BRANCH_ERROR_KEY = 'onErrorActionId';

const ERROR_POLICY_FOLKS: IAutomationsActionFolkConfig[] = [
  {
    key: BRANCH_SUCCESS_KEY,
    label: 'Success',
    type: 'success',
  },
  {
    key: BRANCH_ERROR_KEY,
    label: 'Error',
    type: 'error',
  },
];

export const WAIT_EVENT_MET_KEY = 'met';
export const WAIT_EVENT_TIMED_OUT_KEY = 'timedOut';

const WAIT_EVENT_TIMEOUT_FOLKS: IAutomationsActionFolkConfig[] = [
  { key: WAIT_EVENT_MET_KEY, label: 'Met', type: 'success' },
  { key: WAIT_EVENT_TIMED_OUT_KEY, label: 'Timed out', type: 'error' },
];

/** A wait event with a timeout has two exits instead of nextActionId. */
export const hasWaitEventTimeout = (
  type: string,
  config?: Record<string, any>,
) => type === 'waitEvent' && !!config?.timeout;

/**
 * The action itself says whether a policy fits it. A deferred action reports
 * its failure long after the flow moved on, so there is nothing left to retry
 * or to branch from.
 */
export const supportsErrorPolicy = (
  action?: IAutomationsActionConfigConstants,
) => !!action && (action.errorPolicy?.supported ?? !action.deferred);

export const isBranchingOnError = (config?: Record<string, any>) =>
  (config?.errorPolicy?.onError as string) === 'branch';

/**
 * The folks an action node actually shows. Declared folks come with the action
 * type; the success/error pair belongs to the node, because only that node's
 * error policy asked for it.
 */
export const resolveActionFolks = (
  type: string,
  config: Record<string, any> | undefined,
  actionFolks: Record<string, IAutomationsActionFolkConfig[]>,
): IAutomationsActionFolkConfig[] => {
  const declared = hasWaitEventTimeout(type, config)
    ? WAIT_EVENT_TIMEOUT_FOLKS
    : actionFolks[type] || [];

  return isBranchingOnError(config)
    ? [...declared, ...ERROR_POLICY_FOLKS]
    : declared;
};

/** The folk a source handle belongs to, or nothing for a plain connection. */
export const folkKeyOfHandle = (
  sourceHandle: string | null | undefined,
  folks: IAutomationsActionFolkConfig[],
) => {
  const key = (sourceHandle || '').replace(/-right$/, '');

  return folks.some((folk) => folk.key === key) ? key : undefined;
};
