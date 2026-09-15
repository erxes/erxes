// Match the API's recoverable setup error, not translated/display text.
export const getSavedViberIntegrationId = (
  error: unknown,
): string | undefined => {
  if (
    !error ||
    typeof error !== 'object' ||
    !('graphQLErrors' in error) ||
    !Array.isArray(error.graphQLErrors)
  )
    return;
  for (const item of error.graphQLErrors as unknown[]) {
    if (!item || typeof item !== 'object' || !('extensions' in item)) continue;
    const extensions = item.extensions;
    if (
      extensions &&
      typeof extensions === 'object' &&
      'code' in extensions &&
      extensions.code === 'VIBER_SETUP_INCOMPLETE' &&
      'integrationId' in extensions &&
      typeof extensions.integrationId === 'string' &&
      extensions.integrationId
    )
      return extensions.integrationId;
  }
};
