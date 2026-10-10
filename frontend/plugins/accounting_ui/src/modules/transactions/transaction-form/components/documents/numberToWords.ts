import { getI18n } from 'react-i18next';

const ONES = [
  '',
  'number-one',
  'number-two',
  'number-three',
  'number-four',
  'number-five',
  'number-six',
  'number-seven',
  'number-eight',
  'number-nine',
];

// Form used when followed by another word (e.g. "гурван зуу")
const ONES_ATTR = [
  '',
  'number-one-attributive',
  'number-two',
  'number-three-attributive',
  'number-four-attributive',
  'number-five-attributive',
  'number-six-attributive',
  'number-seven-attributive',
  'number-eight-attributive',
  'number-nine-attributive',
];

const TENS = [
  '',
  'number-ten',
  'number-twenty',
  'number-thirty',
  'number-forty',
  'number-fifty',
  'number-sixty',
  'number-seventy',
  'number-eighty',
  'number-ninety',
];

const TENS_ATTR = [
  '',
  'number-ten-attributive',
  'number-twenty-attributive',
  'number-thirty-attributive',
  'number-forty-attributive',
  'number-fifty-attributive',
  'number-sixty-attributive',
  'number-seventy-attributive',
  'number-eighty-attributive',
  'number-ninety-attributive',
];

const SCALES = [
  { value: 1_000_000_000, attr: 'number-billion', std: 'number-billion' },
  { value: 1_000_000, attr: 'number-million', std: 'number-million' },
  { value: 1_000, attr: 'number-thousand', std: 'number-thousand' },
];

const translateWord = (word: string, language: string): string =>
  getI18n().t(word, {
    ns: 'accounting',
    lng: language.startsWith('en') ? 'en' : 'mn',
  });

// Converts a number below 1000 to Mongolian words.
// `attr` => use the attributive form because more words follow.
const belowThousand = (
  num: number,
  attr: boolean,
  language: string,
): string => {
  const parts: string[] = [];

  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;

  if (hundreds > 0) {
    const hasMore = tens > 0 || ones > 0;
    parts.push(
      ONES_ATTR[hundreds],
      hasMore || attr ? 'number-hundred-attributive' : 'number-hundred',
    );
  }

  if (language.startsWith('en') && tens === 1 && ones > 0) {
    parts.push(translateWord(`number-${10 + ones}`, language));
    return parts.map((part) => translateWord(part, language)).join(' ');
  }

  if (tens > 0) {
    const hasMore = ones > 0;
    parts.push(hasMore || attr ? TENS_ATTR[tens] : TENS[tens]);
  }

  if (ones > 0) {
    parts.push(attr ? ONES_ATTR[ones] : ONES[ones]);
  }

  return parts.map((part) => translateWord(part, language)).join(' ');
};

// Converts a non-negative integer to Mongolian words.
const integerToMongolianText = (value: number, language: string): string => {
  if (value === 0) {
    return translateWord('number-zero', language);
  }

  let remainder = Math.floor(value);
  const parts: string[] = [];

  for (const scale of SCALES) {
    if (remainder >= scale.value) {
      const count = Math.floor(remainder / scale.value);
      remainder = remainder % scale.value;
      const hasMore = remainder > 0;
      parts.push(
        belowThousand(count, true, language),
        translateWord(hasMore ? scale.attr : scale.std, language),
      );
    }
  }

  if (remainder > 0) {
    parts.push(belowThousand(remainder, false, language));
  }

  return parts.filter(Boolean).join(' ');
};

export const amountToMongolianText = (
  amount: number,
  language = getI18n()?.resolvedLanguage || 'mn',
): string => {
  const safeAmount = Number.isFinite(amount) ? Math.abs(amount) : 0;

  const tugrug = Math.floor(safeAmount);
  const mongo = Math.round((safeAmount - tugrug) * 100);

  const sign = amount < 0 ? `${translateWord('number-minus', language)} ` : '';
  const tugrugText = `${integerToMongolianText(
    tugrug,
    language,
  )} ${translateWord('number-currency-tugrik', language)}`;

  if (mongo > 0) {
    return `${sign}${tugrugText} ${integerToMongolianText(
      mongo,
      language,
    )} ${translateWord('number-currency-mongo', language)}`;
  }

  return `${sign}${tugrugText}`;
};
