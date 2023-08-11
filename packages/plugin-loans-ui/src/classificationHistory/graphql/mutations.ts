const classificationRemove = `
  mutation ClassificationRemove($classificationIds: [String]) {
    classificationRemove(classificationIds: $classificationIds)
  }
`;

export default {
  classificationRemove
};
