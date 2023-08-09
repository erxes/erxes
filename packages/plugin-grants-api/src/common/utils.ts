export const validateRequest = doc => {
  if (!doc?.contentTypeId || !doc?.contentType) {
    throw new Error('there is no content id or content type');
  }

  if (!doc?.userIds?.length) {
    throw new Error('you should have at least one user specified');
  }
  if (!doc.action) {
    throw new Error('Please select some action');
  }
};
