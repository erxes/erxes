export const VISIBILITY_RULES = [
  {
    name: 'dayAfterCreated',
    label: 'visibility-rule-day-after-created-desc',
    fallback: 'Only show tickets created after the previous day',
  },
  {
    name: 'structureOnly',
    label: 'visibility-rule-structure-only-desc',
    fallback: "Show only tickets from the user's structure nodes",
  },
  {
    name: 'myTicketsOnly',
    label: 'visibility-rule-my-tickets-only-desc',
    fallback: 'Show only tickets assigned to the user',
  },
] as const;
