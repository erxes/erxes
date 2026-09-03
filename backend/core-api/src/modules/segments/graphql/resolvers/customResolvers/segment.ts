export const Segment = {
  __resolveReference({ _id }: { _id: string }, { models }) {
    return models.Segments.findOne({ _id });
  },
};
