export const callback = (groupType: string) => {
  switch (groupType) {
    case 'stage': {
      return (item, groupObj: any) => item.stage._id === groupObj._id;
    }

    case 'label': {
      return (item, groupObj: any) =>
        item.labels.some(l => l._id === groupObj._id);
    }

    case 'assignee': {
      return (item, groupObj: any) =>
        item.assignedUsers.some(l => l._id === groupObj._id);
    }

    case 'priority': {
      return (item, groupObj: any) => item.priority === groupObj._id;
    }

    default:
      return () => true;
  }
};

export const generateName = groupObj => {
  if (groupObj.name) {
    return groupObj.name;
  }

  const details = groupObj.details || {};

  return details.fullName || details.email;
};
