export const sendError = message => ({
  status: 'error',
  errorMessage: message
});

export const sendSuccess = data => ({
  status: 'success',
  data
});
