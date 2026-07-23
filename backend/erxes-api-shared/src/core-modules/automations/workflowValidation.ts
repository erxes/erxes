import {
  IAutomationAction,
  IAutomationWorkflow,
} from './definitions/automations';

const ACTION_REF_REGEX = /\{\{\s*actions\.([^.\s{}]+)/;

// Problems that must block activating an automation: workflow input bindings
// referencing actions that don't exist in the automation.
export const validateWorkflowBindings = (
  workflows: IAutomationWorkflow[] = [],
  actions: IAutomationAction[] = [],
) => {
  const actionIds = new Set(actions.map(({ id }) => id));
  const errors: string[] = [];

  for (const workflow of workflows) {
    for (const [name, expression] of Object.entries(
      workflow.config?.inputs || {},
    )) {
      const actionRef = String(expression).match(ACTION_REF_REGEX);

      if (actionRef && !actionIds.has(actionRef[1])) {
        errors.push(
          `Workflow "${workflow.name}": input "${name}" references missing action "${actionRef[1]}"`,
        );
      }
    }
  }

  return errors;
};
