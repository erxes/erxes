export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const parseAddress = (value: string) => {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value || '');

  return match
    ? { name: match[1].replace(/^"|"$/g, ''), address: match[2].trim() }
    : { name: '', address: (value || '').trim() };
};

const SPECIALS = /[()<>@,;:\\".[\]]/;

const quoteName = (name: string) => {
  const clean = name.replace(/[\r\n]/g, ' ').trim();

  if (!clean) {
    return '';
  }

  return SPECIALS.test(clean)
    ? `"${clean.replace(/(["\\])/g, '\\$1')}"`
    : clean;
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
    from: `${quoteName(name) || address} <${alignedFrom}>`,
    replyTo: reply || (address === alignedFrom ? undefined : address),
  };
};
