export type generatedList = {
  value: string;
  label?: string;
};

export const postUsername = ({ post, typeKey, crmKey, cpKey }) => {
  if (post[typeKey] === 'CRM') {
    return (
      (post[crmKey]?.username || post[crmKey]?.email || post[crmKey]?._id) +
      ' (Erxes)'
    );
  }
  if (post[typeKey] === 'CP') {
    return (
      (post[cpKey]?.username || post[cpKey]?.email || post[cpKey]?._id) +
      ' (Business Portal)'
    );
  }
};

export const generateModuleParams = (list: any[]): any[] => {
  return list.map(item => ({
    value: item._id,
    label: item.name,
    _id: item._id
  }));
};

export const generateListParams = (items: any[]): generatedList[] => {
  return items.map(item => ({
    value: item._id,
    label: item.email || item.name,
    _id: item._id
  }));
};

export const correctValue = (data: generatedList): string => {
  return data ? data.value : '';
};
