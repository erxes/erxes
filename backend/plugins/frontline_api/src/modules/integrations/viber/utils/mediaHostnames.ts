export const VIBER_MEDIA_HOSTNAMES_MAX_COUNT = 32;

// Exact, administrator-approved DNS names only; this does not verify ownership.
export const normalizeViberMediaHostnames = (value: unknown): string[] => {
  if (!Array.isArray(value) || value.length > VIBER_MEDIA_HOSTNAMES_MAX_COUNT) {
    throw new Error('Enter at most 32 media hostnames.');
  }

  const hostnames = value.map((entry: unknown) => {
    if (typeof entry !== 'string') {
      throw new Error(
        'Enter exact public hostnames, without URLs or wildcards.',
      );
    }
    const hostname = entry.trim().toLowerCase();
    const labels = hostname.split('.');
    if (
      hostname.length > 253 ||
      labels.length < 2 ||
      !labels.every((label) =>
        /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label),
      ) ||
      !/^[a-z][a-z0-9-]*$/.test(labels[labels.length - 1]) ||
      /\.(localhost|local|internal|lan|home|arpa)$/.test(hostname)
    ) {
      throw new Error(
        'Enter exact public hostnames, without URLs or wildcards.',
      );
    }
    return hostname;
  });

  return [...new Set(hostnames)];
};
