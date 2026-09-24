export const assertValidPostRating = (rating: number): void => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer from 1 to 5');
  }
};
