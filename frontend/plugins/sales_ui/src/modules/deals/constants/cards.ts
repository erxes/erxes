export const stages = [
  {
    _id: "1",
    title: "OnBoard",
  },
  {
    _id: "2",
    title: "Support",
  },
  {
    _id: "3",
    title: "Enhancement",
  }
];

export const cards = [
  {
    _id: "11",
    title: "Test 1",
    stageId: "1"
  },
  {
    _id: "12",
    title: "Test 2",
    stageId: "1"
  },
  {
    _id: "13",
    title: "Test 3",
    stageId: "1"
  },
  {
    _id: "14",
    title: "Test 4",
    stageId: "2"
  },
  {
    _id: "15",
    title: "Test 5",
    stageId: "3"
  },
  {
    _id: "16",
    title: "Test 6",
    stageId: "3"
  }
];

export const PROJECT_PRIORITIES_OPTIONS = [
  'No Priority',
  'Minor',
  'Medium',
  'High',
  'Critical',
];

export type TPriorityValue = (typeof PROJECT_PRIORITIES_OPTIONS)[number];
