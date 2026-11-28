import { z } from 'zod';

/**
 * What the payer needs to pay an invoice: a QR (text and image), a short
 * link, bank app links, what a page open inside the payer's app passes to it,
 * or where to transfer the money.
 */
export const PayerInstructions = z.object({
  qrText: z.string().nullable(),
  qrImage: z.string().nullable(),
  shortUrl: z.string().nullable(),
  links: z.array(z.object({ name: z.string(), logo: z.string().nullable(), link: z.string() })),
  /** What a page open inside the payer's app passes to the app's pay call (Toki's mini program: `buy()`). */
  inApp: z
    .object({ app: z.string(), data: z.record(z.string(), z.union([z.string(), z.number()])) })
    .nullable(),
  /** Where to transfer the money, and the reference to write as its description (Khan Bank). */
  bankTransfer: z
    .object({
      bank: z.string(),
      accountNumber: z.string(),
      iban: z.string().nullable(),
      accountName: z.string().nullable(),
      amount: z.number(),
      reference: z.string(),
    })
    .nullable(),
});

export type PayerInstructions = z.infer<typeof PayerInstructions>;
