export const duedateFilter = [
  {name: "noCloseDate", _id: "1"},
  {name: "nextMonth", _id: "2"},
  {name: "nextWeek", _id: "3"},
  {name: "overdue", _id: "4"},
  {name: "nextDay", _id: "5"},
];
  
export const priorityFilter = [{name: "Critical", _id: "1"}, {name: "High", _id: "2"}, {name: "Normal", _id: "3"}, {name: "Low", _id: '4'}];
  
export const typeFilters = [
  { showMode: "Stage", setMode: "stage" },
  { showMode: "Label", setMode: "label" },
  { showMode: "Priority", setMode: "priority" },
  { showMode: "Due Date", setMode: "duedate" },
  { showMode: "Assigned User", setMode: "user" },
];

export const viewModes = [
  { label: "List View", type: "list", icon: "list-ul" },
  { label: "Board View", type: "board", icon: "postcard" },
];