export const VISIBILITY_RULES = [
  {
    name: 'dayAfterCreated',
    title: 'Day after created',
    description: 'Only show tickets created after the previous day',
  },
  {
    name: 'branchOnly',
    title: 'Branch only',
    description: "Show only tickets from user's branch",
  },
  {
    name: 'myTicketsOnly',
    title: 'My tickets only',
    description: 'Show only tickets assigned to the user',
  },
  {
    name: 'departmentOnly',
    title: 'Department only',
    description: "Show only tickets from user's department",
  },
] as const;
