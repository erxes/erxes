export const FILTER_OPTIONS = {
  ownerType: [
    { label: "Customer", value: "customer" },
    { label: "Company", value: "company" },
    { label: "Team Member", value: "user" },
    { label: "Unknown", value: "unknown" },
  ],
  orderType: [{ label: "Date", value: "createdAt" }],
  order: [
    { label: "Ascending", value: 1 },
    { label: "Descending", value: -1 },
  ],
  action: [
    { label: "Add", value: "add" },
    { label: "Subtract", value: "subtract" },
    { label: "Has A description", value: "manual" },
  ],
};
