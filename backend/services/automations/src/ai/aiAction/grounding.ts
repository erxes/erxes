// A figure in a reply must come from somewhere the model was shown. Digits are
// the same in every language, so this needs no word lists; grouping marks are
// dropped so "1,230,000" and "1230000" compare equal.
const NUMBER = /\d+(?:[.,\u00a0\u202f ]\d+)*/g;

// Counts, list positions and day ranges are rarely the facts that mislead.
const MIN_CHECKED_DIGITS = 3;

const extractNumbers = (text: string) =>
  [...text.matchAll(NUMBER)].map((match) => ({
    digits: match[0].replace(/\D/g, ''),
    suffix: text.charAt((match.index || 0) + match[0].length),
  }));

export const findUngroundedNumbers = ({
  reply,
  sources,
}: {
  reply: string;
  sources: string[];
}) => {
  const grounded = new Set<string>();

  for (const source of sources) {
    for (const { digits, suffix } of extractNumbers(source)) {
      grounded.add(digits);

      // Price lists write thousands and millions as "370K" or "4M".
      if (suffix === 'K' || suffix === 'k') {
        grounded.add(`${digits}000`);
      }

      if (suffix === 'M' || suffix === 'm') {
        grounded.add(`${digits}000000`);
      }
    }
  }

  return [
    ...new Set(
      extractNumbers(reply)
        .map(({ digits }) => digits)
        .filter(
          (digits) =>
            digits.length >= MIN_CHECKED_DIGITS && !grounded.has(digits),
        ),
    ),
  ];
};

export const buildUngroundedNumbersDirective = (numbers: string[]) =>
  [
    `Your reply stated figures that appear in none of the sources or messages you were given: ${numbers.join(
      ', ',
    )}.`,
    'Write the reply again in the same language and format, using only figures exactly as the sources write them. If a figure is not in them, say it is not available instead of giving one.',
  ].join(' ');
