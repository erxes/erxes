export const getFieldType = (type: string) => {
  if (type.startsWith('relation:')) {
    return { type: 'relation', relationType: type.replace('relation:', '') };
  }
  return { type };
};
