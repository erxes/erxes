const PLUGINS = [
  { message: "Sales", name: "sales" },
  { message: "Tasks", name: "task" },
  { message: "Tickets", name: "tickets" },
  { message: "Inbox", name: "inbox" },
  { message: "Automations", name: "automations" }
];

const EXPERIENCES = [
  { message: "Experience 1", name: "exp1" },
  { message: "Experience 2", name: "exp2" }
];

const PLUGINS_WITH_EXPERIENCE = {
  exp1: [{ name: "sales" }, { name: "tasks" }],
  exp2: [{ name: "sales" }, { name: "tasks" }, { name: "purchases" }]
};

module.exports = { PLUGINS, EXPERIENCES, PLUGINS_WITH_EXPERIENCE };
