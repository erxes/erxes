export const renderText = value => {
  switch (value) {
    case 'customer':
      return 'Customers';
    case 'company':
      return 'Companies';
    case 'deal':
      return 'Deals';
    case 'ticket':
      return 'Tickets';
    case 'task':
      return 'Tasks';
    case 'lead':
      return 'Leads';
    default:
      return value;
  }
};

export const renderIcon = contentType => {
  switch (contentType) {
    case 'customer':
      return 'users-alt';
    case 'company':
      return 'building';
    case 'deal':
      return 'signal-alt-3';
    case 'task':
      return 'laptop';
    case 'ticket':
      return 'ticket';

    case 'lead':
      return 'file-alt';

    default:
      return 'users-alt';
  }
};
