const pendingUpdates = new Map<string, Promise<void>>();

/** Apply edits and deletes in arrival order within the tenant's gateway owner. */
export const processDiscordMessageUpdate = async (
  subdomain: string,
  messageId: string,
  applyUpdate: () => Promise<void>,
): Promise<void> => {
  const key = `${subdomain}:${messageId}`;
  const previous = pendingUpdates.get(key) || Promise.resolve();
  // The previous caller receives its error; a failure must not block later events.
  const current = previous.catch(() => undefined).then(applyUpdate);
  pendingUpdates.set(key, current);

  try {
    await current;
  } finally {
    if (pendingUpdates.get(key) === current) {
      pendingUpdates.delete(key);
    }
  }
};
