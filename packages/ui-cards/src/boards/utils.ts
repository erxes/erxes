type Options = {
  _id: string;
  name?: string;
  type?: string;
  index?: number;
  itemId?: string;
};

// get options for react-select-plus
export function selectOptions(array: Options[] = []) {
  return array.map(item => ({ value: item._id, label: item.name }));
}

export const getWarningMessage = (type: string): string => {
  return `This will permanently delete the current ${type}. Are you absolutely sure?`;
};
