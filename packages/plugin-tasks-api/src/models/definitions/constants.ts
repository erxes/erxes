export const VISIBLITIES = {
  PUBLIC: "public",
  PRIVATE: "private",
  ALL: ["public", "private"]
};

export const HACK_SCORING_TYPES = {
  RICE: "rice",
  ICE: "ice",
  PIE: "pie",
  ALL: ["rice", "ice", "pie"]
};

export const PROBABILITY = {
  TEN: "10%",
  TWENTY: "20%",
  THIRTY: "30%",
  FOURTY: "40%",
  FIFTY: "50%",
  SIXTY: "60%",
  SEVENTY: "70%",
  EIGHTY: "80%",
  NINETY: "90%",
  WON: "Won",
  LOST: "Lost",
  DONE: "Done",
  RESOLVED: "Resolved",
  ALL: [
    "10%",
    "20%",
    "30%",
    "40%",
    "50%",
    "60%",
    "70%",
    "80%",
    "90%",
    "Won",
    "Lost",
    "Done",
    "Resolved"
  ]
};

export const BOARD_STATUSES = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  ALL: ["active", "archived"]
};

export const BOARD_STATUSES_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" }
];

export const TIME_TRACK_TYPES = {
  STARTED: "started",
  STOPPED: "stopped",
  PAUSED: "paused",
  COMPLETED: "completed",
  ALL: ["started", "stopped", "paused", "completed"]
};

export const BOARD_TYPES = {
  DEAL: "deal",
  TICKET: "task",
  ALL: ["deal", "task"]
};

export const NOTIFICATION_TYPES = {
  DEAL_ADD: "dealAdd",
  DEAL_REMOVE_ASSIGN: "dealRemoveAssign",
  DEAL_EDIT: "dealEdit",
  DEAL_CHANGE: "dealChange",
  DEAL_DUE_DATE: "dealDueDate",
  DEAL_DELETE: "dealDelete",
  TICKET_ADD: "taskAdd",
  TICKET_REMOVE_ASSIGN: "taskRemoveAssign",
  TICKET_EDIT: "taskEdit",
  TICKET_CHANGE: "taskChange",
  TICKET_DUE_DATE: "taskDueDate",
  TICKET_DELETE: "taskDelete",

  ALL: [
    "dealAdd",
    "dealRemoveAssign",
    "dealEdit",
    "dealChange",
    "dealDueDate",
    "dealDelete",
    "taskAdd",
    "taskRemoveAssign",
    "taskEdit",
    "taskChange",
    "taskDueDate",
    "taskDelete"
  ]
};

export const ACTIVITY_CONTENT_TYPES = {
  TICKET: "ticket",
  TASK: "task",
  PRODUCT: "product",
  GROWTH_HACK: "growthHack",
  CHECKLIST: "checklist",

  ALL: ["ticket", "task", "product", "growthHack", "checklist"]
};

export const EXPENSE_DIVIDE_TYPES = {
  QUANTITY: "quantity",
  AMOUNT: "amount",
  ALL: ["quantity", "amount"]
};
