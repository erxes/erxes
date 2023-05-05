export const validateRequest = doc => {
  if (!doc?.cardId || !doc?.cardType) {
    throw new Error('there is no card id or card type');
  }

  if (!doc?.userIds?.length) {
    throw new Error('you should have at least one user specified');
  }
  if (doc.action) {
    throw new Error('Please select some action');
  }
};
