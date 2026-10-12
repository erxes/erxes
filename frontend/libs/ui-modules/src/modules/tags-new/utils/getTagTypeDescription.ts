const startCase: (value: string) => string = require('lodash/startCase');
export const getTagTypeDescription = ({
  type,
}: {
  type: string | null;
  tagTypes: Record<string, { description: string; contentType: string }[]>;
}) => {
  let result = '';
  if (!type) {
    return 'Workspace';
  }
  if (!type?.startsWith('core')) {
    result += type.split(':')[0] + ' ';
  }
  result += type.split(':')[1];
  return startCase(result);
};
