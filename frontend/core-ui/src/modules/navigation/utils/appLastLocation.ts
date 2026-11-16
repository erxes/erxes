export const getAppResumePath = (state: unknown): string | undefined => {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('appResumePath' in state) ||
    typeof state.appResumePath !== 'string' ||
    !state.appResumePath.startsWith('/') ||
    state.appResumePath.startsWith('//')
  ) {
    return undefined;
  }

  return state.appResumePath;
};
