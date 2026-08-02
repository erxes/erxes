export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Splits `Name <a@b.c>` into its parts; a bare address has no name. */
export const parseAddress = (value: string) => {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value || '');

  return match
    ? { name: match[1].replace(/^"|"$/g, ''), address: match[2].trim() }
    : { name: '', address: (value || '').trim() };
};

export const alignSender = (
  requested: string,
  replyTo?: string,
  alignedFrom?: string | null,
): { from: string; replyTo?: string } => {
  const reply = replyTo?.trim() || undefined;

  if (!alignedFrom) {
    return { from: requested, replyTo: reply };
  }

  const { name, address } = parseAddress(requested);

  return {
    from: `${name || address} <${alignedFrom}>`,
    replyTo: reply || (address === alignedFrom ? undefined : address),
  };
};
