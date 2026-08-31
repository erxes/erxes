import { graphqlErrorMessage } from '@/modules/apollo/utils/result';

/** What erxes rejects a contact write with, said in the reader's language. */
const REASONS: [RegExp, string][] = [
  [
    /duplicated phone/i,
    'Энэ утасны дугаар өөр харилцагчид бүртгэлтэй байна. Өөр дугаар оруулна уу.',
  ],
  [/duplicated email/i, 'Энэ и-мэйл өөр харилцагчид бүртгэлтэй байна.'],
  [
    /no linked customer/i,
    'Таны бүртгэл харилцагчийн картад холбогдоогүй байна. Дэмжлэгийн багт хандана уу.',
  ],
  [
    /not authenticated|not logged in/i,
    'Нэвтрэлт хүчингүй боллоо. Дахин нэвтэрч оролдоно уу.',
  ],
];

/*
 * Anything unrecognised is a fault on our side of the wire, so the reader gets
 * a plain sentence rather than the server's stack-level wording.
 */
const FALLBACK = 'Нэр, утсыг бүртгэлд хадгалж чадсангүй.';

export const contactErrorMessage = (caught: unknown): string => {
  const raw = graphqlErrorMessage(caught);
  const known = REASONS.find(([pattern]) => pattern.test(raw));

  return known?.[1] ?? FALLBACK;
};
