import {
  IAutomationAction,
  IAutomationWorkflow,
  IAutomationWorkflowForEach,
} from './definitions/automations';

const ACTION_REF_REGEX = /\{\{\s*actions\.([^.\s{}]+)/;

export const WORKFLOW_FOR_EACH_MAX_ITEMS = 100;

// A for-each needs a list and an input to receive each item; anything less
// is treated as a plain single run.
export const readWorkflowForEach = (
  config?: IAutomationWorkflow['config'],
): IAutomationWorkflowForEach | null => {
  const forEach = config?.forEach;

  if (!forEach?.items?.trim() || !forEach.itemInput) {
    return null;
  }

  return {
    items: forEach.items.trim(),
    itemInput: forEach.itemInput,
    onItemError: forEach.onItemError === 'stop' ? 'stop' : 'continue',
  };
};

const validateWorkflowForEach = (workflow: IAutomationWorkflow) => {
  const forEach = workflow.config?.forEach;

  if (!forEach) {
    return [];
  }

  const errors: string[] = [];

  if (!forEach.items?.trim()) {
    errors.push(`Workflow "${workflow.name}": for-each needs a list`);
  }

  if (
    !forEach.itemInput ||
    workflow.config?.inputs?.[forEach.itemInput] === undefined
  ) {
    errors.push(
      `Workflow "${workflow.name}": for-each item input "${
        forEach.itemInput || ''
      }" is not an input of the workflow`,
    );
  }

  return errors;
};

// Problems that must block activating an automation: workflow input bindings
// referencing actions that don't exist in the automation, and incomplete
// for-each settings.
export const validateWorkflowBindings = (
  workflows: IAutomationWorkflow[] = [],
  actions: IAutomationAction[] = [],
) => {
  const actionIds = new Set(actions.map(({ id }) => id));
  const errors: string[] = [];

  for (const workflow of workflows) {
    const forEach = workflow.config?.forEach;
    const expressions = Object.entries(workflow.config?.inputs || {})
      // The item input is filled from the list, not from its binding
      .filter(([name]) => name !== forEach?.itemInput)
      .map(([name, expression]) => [name, String(expression)]);

    if (forEach?.items) {
      expressions.push(['for-each list', forEach.items]);
    }

    for (const [name, expression] of expressions) {
      const actionRef = expression.match(ACTION_REF_REGEX);

      if (actionRef && !actionIds.has(actionRef[1])) {
        errors.push(
          `Workflow "${workflow.name}": input "${name}" references missing action "${actionRef[1]}"`,
        );
      }
    }

    errors.push(...validateWorkflowForEach(workflow));
  }

  return errors;
};
