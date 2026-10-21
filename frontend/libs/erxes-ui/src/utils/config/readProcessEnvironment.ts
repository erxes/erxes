export const readProcessEnvironment = (
  read: () => string | undefined,
): string | undefined => {
  try {
    return read();
  } catch {
    return undefined;
  }
};
