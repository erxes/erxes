export const filterOptions = {
  ownerType: [
    { label: 'Customer', value: 'customer' },
    { label: 'Company', value: 'company' },
    { label: 'Team Member', value: 'user' },
  ],
  orderType: [
    { label: 'Date', value: 'createdAt' },
    { label: 'Changed Score', value: 'changeScore' },
  ],
  order: [
    { label: 'Ascending', value: 1 },
    { label: 'Descending', value: -1 },
  ],
};
