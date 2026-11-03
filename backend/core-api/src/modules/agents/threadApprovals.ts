/** The mutation root fields the user allowed for the rest of a thread. */
export const readAllowedRootFields = (
  metadata: Record<string, unknown> | undefined,
) => {
  const fields = metadata?.allowedRootFields;

  return Array.isArray(fields)
    ? fields.filter((field): field is string => typeof field === 'string')
    : [];
};

/**
 * True when the acting user allowed every one of these root fields for the
 * thread in the request context, so the call skips its approval gate.
 */
export const isAllowedForThread = async (
  requestContext: Record<string, unknown> | undefined,
  rootFields: string[],
) => {
  const { subdomain, userId, threadId } = requestContext ?? {};

  if (
    typeof subdomain !== 'string' ||
    typeof userId !== 'string' ||
    typeof threadId !== 'string' ||
    !rootFields.length
  ) {
    return false;
  }

  // Loaded lazily: memory pulls in the agent, which imports the tools.
  const { getAgentsMemory } = await import('./memory.js');
  const memory = await getAgentsMemory(subdomain);
  const thread = await memory.getThreadById({ threadId });

  if (thread?.resourceId !== userId) {
    return false;
  }

  const allowed = readAllowedRootFields(thread.metadata);
  return rootFields.every((field) => allowed.includes(field));
};
