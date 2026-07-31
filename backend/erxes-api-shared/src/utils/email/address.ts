/**
 * One address must have exactly one history. Without this, `Foo@Gmail.com ` and
 * `foo@gmail.com` accumulate separate records, and a bounce recorded against
 * one leaves the other looking clean.
 */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
