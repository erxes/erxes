/**
 * Matching a bank transfer to an invoice by the reference the payer wrote in
 * its description (Khan Bank and TDB transfers).
 */

import type { StatementLine } from '../banks/types';

/** "1000 — Installment 1" and "1000-installment1" → ["1000", "installment", "1"]. */
export const referenceWords = (text: string | null | undefined) =>
  (text ?? '')
    .toLowerCase()
    .replaceAll(/([a-zа-яөү])(\d)|(\d)([a-zа-яөү])/giu, '$1$3 $2$4')
    .split(/[^a-z0-9а-яөү]+/iu)
    .filter(Boolean);

/**
 * The bank appends the sender to incoming transfers ("… ХААНААС: 320000
 * <sender>"): the paying bank, its 6-digit code and the sender's name, which
 * must not supply words of the reference.
 */
const SENDER = /\s*[^\s:]+:\s*\d{6}(?:\s.*)?$/u;

/** The reference's words, in order and unbroken (so "installment 1" isn't "installment 10"). */
const mentions = (description: string | null | undefined, reference: string[]) => {
  const words = referenceWords((description ?? '').replace(SENDER, ''));

  for (let start = 0; start + reference.length <= words.length; start += 1)
    if (reference.every((word, offset) => words[start + offset] === word)) return true;

  return false;
};

/**
 * When the bank says the line was made; a time it gives without a zone is
 * Ulaanbaatar's. A day without a time counts as the day's end, so a transfer
 * made later the same day as the invoice still matches it.
 */
const madeAt = (line: StatementLine) => {
  if (!line.date) return null;

  const text = line.date.trim().replace(' ', 'T');
  const timed = /^\d{4}-\d{2}-\d{2}$/u.test(text) ? `${text}T23:59:59` : text;
  const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/u.test(timed) ? timed : `${timed}+08:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * The incoming transfers that could pay an invoice: its amount, made since it
 * was opened, and its reference in the description. Oldest first.
 */
export const matchingTransfers = (
  lines: StatementLine[],
  invoice: { amount: number; reference: string; since: Date },
) => {
  const reference = referenceWords(invoice.reference);

  if (reference.length === 0) return [];

  return lines
    .map((line) => ({ line, at: madeAt(line) }))
    .filter(
      ({ line, at }) =>
        line.amount === invoice.amount &&
        (at === null || at >= invoice.since) &&
        mentions(line.description, reference),
    )
    .toSorted((a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0))
    .map(({ line }) => line);
};
