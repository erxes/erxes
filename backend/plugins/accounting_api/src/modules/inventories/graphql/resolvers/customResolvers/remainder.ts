export default {
  async category(remainder: any) {
    if (!remainder.categoryId) {
      return;
    }
    return {
      __typename: 'ProductCategory',
      _id: remainder.categoryId,
    };
  },
};
