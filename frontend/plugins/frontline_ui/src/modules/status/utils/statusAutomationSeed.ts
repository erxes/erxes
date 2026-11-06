import { generateAutomationElementId } from 'ui-modules';
import { TICKET_STATUS_CHANGED_TRIGGER_TYPE } from '~/widgets/automations/modules/ticket/states/ticketStatusChangedTriggerForm';

type TSeedStatus = { value: string; label: string };

/**
 * A "status changed" trigger split by the status the ticket moved to, one
 * branch per status, left empty for the builder to fill. Every status picked
 * means any move counts, so the trigger names none.
 */
export const buildStatusAutomationSeed = ({
  pipelineId,
  statuses,
  pickedAll,
}: {
  pipelineId: string;
  statuses: TSeedStatus[];
  pickedAll: boolean;
}) => {
  const splitId = generateAutomationElementId();

  return {
    triggers: [
      {
        id: generateAutomationElementId(),
        type: TICKET_STATUS_CHANGED_TRIGGER_TYPE,
        label: 'Ticket status changed',
        icon: 'IconProgressCheck',
        isCustom: true,
        actionId: splitId,
        position: { x: 0, y: 0 },
        config: {
          pipelineId,
          toStatusIds: pickedAll ? [] : statuses.map(({ value }) => value),
        },
      },
    ],
    actions: [
      {
        id: splitId,
        type: 'split',
        label: 'Split',
        icon: 'IconArrowsSplit',
        // Matches the horizontal gap the node library uses.
        position: { x: 500, y: 0 },
        config: {
          options: statuses.map(({ value, label }) => ({
            id: generateAutomationElementId(),
            label,
            config: {
              conditionsConjunction: 'and',
              conditions: [
                {
                  propertyType: TICKET_STATUS_CHANGED_TRIGGER_TYPE,
                  propertyName: 'statusId',
                  propertyOperator: 'e',
                  propertyValue: value,
                },
              ],
            },
          })),
        },
      },
    ],
  };
};
