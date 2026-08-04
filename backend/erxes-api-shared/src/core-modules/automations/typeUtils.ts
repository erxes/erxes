export const splitType = (type: string) => {
  return type.replace(/\./g, ':').split(':');
};
