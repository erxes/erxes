import {
  TAutomationBuiltInTemplate,
  TAutomationBuiltInTemplateRequirement,
  TEMPLATE_CORE_REQUIREMENT_KINDS,
} from 'erxes-api-shared/core-modules';

const TASK_CREATE_ACTION = 'operation:task.tasks.create';
const DELAY_ACTION = 'delay';

/**
 * Asked as one question, because a status only means something inside a team:
 * the picker offers both together and the answer carries both.
 */
const taskDestination = (order: number) => [
  {
    key: 'destination',
    kind: 'operation:task.status',
    label: 'Choose where the task opens',
    description: 'The team the task belongs to, and the status it starts in.',
    fills: [
      { order, path: 'teamId', from: 'teamId' },
      { order, path: 'status', from: 'status' },
    ],
  },
];

/**
 * What the task asks of the person, written by the organization before
 * installing; it becomes the task's description.
 */
const taskInstructions = (
  order: number,
  label: string,
  placeholder: string,
): TAutomationBuiltInTemplateRequirement => ({
  key: 'instructions',
  kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
  label,
  input: { multiline: true, placeholder },
  fills: [{ order, path: 'description' }],
});

/**
 * Flows shipped with the plugin, built from its own task action and core's
 * delay.
 *
 * Neither restricts the target, so both are offered on the automations canvas
 * and on a broadcast campaign — where they give one person on the team a task
 * per customer the campaign reaches, rather than sending that customer
 * anything.
 */
export const operationWorkflowTemplates: TAutomationBuiltInTemplate[] = [
  {
    id: 'operation.follow-up-task',
    name: 'Give someone a follow-up task',
    description:
      'Waits a few days, then puts a task on the board so a person — not an email — does the following up.',
    flow: [
      {
        order: 1,
        type: DELAY_ACTION,
        label: 'Wait 3 days',
        config: { value: '3', type: 'day' },
        next: 2,
      },
      {
        order: 2,
        type: TASK_CREATE_ACTION,
        label: 'Create the follow-up task',
        config: {
          name: 'Follow up with {{ trigger.firstName }} {{ trigger.lastName }}',
          description:
            'Reach out and find out whether they still need anything.',
          teamId: '',
          status: '',
        },
      },
    ],
    requirements: [
      ...taskDestination(2),
      taskInstructions(
        2,
        'Say what the task should ask the person to do',
        'Reach out and find out whether they still need anything.',
      ),
    ],
  },
  {
    id: 'operation.hand-off-now',
    name: 'Hand off to a person now',
    description:
      'Opens a task straight away, for the cases a message cannot settle and someone has to pick it up.',
    flow: [
      {
        order: 1,
        type: TASK_CREATE_ACTION,
        label: 'Create the task',
        config: {
          name: 'Reach out to {{ trigger.firstName }} {{ trigger.lastName }}',
          description: '',
          teamId: '',
          status: '',
        },
      },
    ],
    requirements: [
      ...taskDestination(1),
      taskInstructions(
        1,
        'Say what the person picking this up should do',
        'Call them and settle what the message could not.',
      ),
    ],
  },
];
