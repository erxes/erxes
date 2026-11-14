import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';
import { field, LEADS, segmentPart, stepFill } from './helpers';

const step = stepFill('follow-up');
const REMIND_AFTER_DAYS = 3;

/**
 * Gives each new lead an owner in turns and tells them; if it is still a
 * lead a few days later, reminds the owner once.
 */
export const leadFollowUpTemplate: TTemplate = {
  id: 'core.lead-follow-up',
  version: 1,
  name: 'Follow up on new leads',
  icon: 'IconUserSearch',
  description: `Assigns each new lead to the next available team member and reminds them if it is still a lead after ${REMIND_AFTER_DAYS} days.`,
  requirements: [
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who takes new leads',
      description: 'They take turns; anyone unavailable is skipped.',
      fills: [step(1, 'candidateIds')],
    },
    {
      key: 'fallback',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBER,
      label: 'When nobody is available',
      description: 'Who takes the lead then, so none is left unowned.',
      fills: [step(1, 'fallbackUserId')],
    },
  ],
  parts: [
    segmentPart('new', 'Leads added today', LEADS, [
      // The day they were added, so existing leads are left alone
      field(LEADS, 'createdAt', 'woad', 0),
    ]),
    segmentPart('stillLead', 'Still a lead', LEADS, [
      field(LEADS, 'state', 'e', 'lead'),
    ]),
  ],
  journeys: [
    {
      key: 'follow-up',
      name: 'Follow up on new leads',
      description: 'Assigns a new lead in turns and reminds the owner later.',
      trigger: { type: LEADS, config: { contentId: '{{ parts.new }}' } },
      flow: [
        {
          order: 1,
          type: 'pickMember',
          label: 'Pick who is next',
          config: { candidateIds: '', method: 'roundRobin', fallbackUserId: '' },
          next: 2,
        },
        {
          order: 2,
          type: 'setProperty',
          label: 'Make them the owner',
          config: {
            module: LEADS,
            rules: [
              {
                field: 'ownerId',
                operator: 'set',
                value: '{{ actions.1.userId }}',
              },
            ],
          },
          next: 3,
        },
        {
          order: 3,
          type: 'sendNotification',
          label: 'Tell them',
          config: {
            userIds: '{{ actions.1.userId }}',
            title: 'New lead for you: {{ trigger.firstName }} {{ trigger.lastName }}',
            message: '{{ trigger.primaryEmail }} {{ trigger.primaryPhone }}',
            priority: 'medium',
          },
          next: 4,
        },
        {
          order: 4,
          type: 'delay',
          label: `Wait ${REMIND_AFTER_DAYS} days`,
          config: { value: String(REMIND_AFTER_DAYS), type: 'day' },
          next: 5,
        },
        {
          order: 5,
          type: 'if',
          label: 'Still a lead?',
          config: { contentId: '{{ parts.stillLead }}' },
          next: { yes: 6 },
        },
        {
          order: 6,
          type: 'sendNotification',
          label: 'Remind the owner',
          config: {
            userIds: '{{ actions.1.userId }}',
            title: `Still a lead after ${REMIND_AFTER_DAYS} days: {{ trigger.firstName }} {{ trigger.lastName }}`,
            message: 'Time to follow up.',
            priority: 'high',
          },
        },
      ],
    },
  ],
};
