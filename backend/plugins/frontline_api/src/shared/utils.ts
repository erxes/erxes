import { ApiResponse } from './types';

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  status: 'success',
  data,
});

export const createErrorResponse = (message: string): ApiResponse => ({
  status: 'error',
  errorMessage: message,
});

export const handleAsyncError = async <T>(
  fn: () => Promise<T>,
  errorMessage?: string,
): Promise<ApiResponse<T>> => {
  try {
    const result = await fn();
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(errorMessage || error.message);
  }
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage?: string,
) => {
  return async (...args: T): Promise<ApiResponse<R>> => {
    return handleAsyncError(() => fn(...args), errorMessage);
  };
};
