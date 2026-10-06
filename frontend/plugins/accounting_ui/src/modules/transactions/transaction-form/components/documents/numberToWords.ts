import { getI18n } from 'react-i18next';

const ONES = [
  '',
  'нэг',
  'хоёр',
  'гурав',
  'дөрөв',
  'тав',
  'зургаа',
  'долоо',
  'найм',
  'ес',
];

// Form used when followed by another word (e.g. "гурван зуу")
const ONES_ATTR = [
  '',
  'нэгэн',
  'хоёр',
  'гурван',
  'дөрвөн',
  'таван',
  'зургаан',
  'долоон',
  'найман',
  'есөн',
];

const TENS = [
  '',
  'арав',
  'хорь',
  'гуч',
  'дөч',
  'тавь',
  'жар',
  'дал',
  'ная',
  'ер',
];

const TENS_ATTR = [
  '',
  'арван',
  'хорин',
  'гучин',
  'дөчин',
  'тавин',
  'жаран',
  'далан',
  'наян',
  'ерэн',
];

const SCALES = [
  { value: 1_000_000_000, attr: 'тэрбум', std: 'тэрбум' },
  { value: 1_000_000, attr: 'сая', std: 'сая' },
  { value: 1_000, attr: 'мянга', std: 'мянга' },
];

// Converts a number below 1000 to Mongolian words.
// `attr` => use the attributive form because more words follow.
const belowThousand = (num: number, attr: boolean): string => {
  const parts: string[] = [];

  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;

  if (hundreds > 0) {
    const hasMore = tens > 0 || ones > 0;
    parts.push(ONES_ATTR[hundreds], hasMore || attr ? 'зуун' : 'зуу');
  }

  if (tens > 0) {
    const hasMore = ones > 0;
    parts.push(hasMore || attr ? TENS_ATTR[tens] : TENS[tens]);
  }

  if (ones > 0) {
    parts.push(attr ? ONES_ATTR[ones] : ONES[ones]);
  }

  return parts.join(' ');
};

// Converts a non-negative integer to Mongolian words.
const integerToMongolianText = (value: number): string => {
  if (value === 0) {
    return 'тэг';
  }

  let remainder = Math.floor(value);
  const parts: string[] = [];

  for (const scale of SCALES) {
    if (remainder >= scale.value) {
      const count = Math.floor(remainder / scale.value);
      remainder = remainder % scale.value;
      const hasMore = remainder > 0;
      parts.push(belowThousand(count, true), hasMore ? scale.attr : scale.std);
    }
  }

  if (remainder > 0) {
    parts.push(belowThousand(remainder, false));
  }

  return parts.filter(Boolean).join(' ');
};

export const amountToMongolianText = (amount: number): string => {
  const safeAmount = Number.isFinite(amount) ? Math.abs(amount) : 0;

  const tugrug = Math.floor(safeAmount);
  const mongo = Math.round((safeAmount - tugrug) * 100);

  const sign = amount < 0 ? 'хасах ' : '';
  const tugrugText = `${integerToMongolianText(tugrug)} төгрөг`;

  if (mongo > 0) {
    return `${sign}${tugrugText} ${integerToMongolianText(mongo)} мөнгө`;
  }

  return `${sign}${tugrugText}`;
};

const ENGLISH_ONES = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const ENGLISH_TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

const integerToEnglishText = (value: number): string => {
  if (value < 20) return ENGLISH_ONES[value];
  if (value < 100) {
    const remainder = value % 10;
    return (
      ENGLISH_TENS[Math.floor(value / 10)] +
      (remainder ? `-${ENGLISH_ONES[remainder]}` : '')
    );
  }
  for (const [scale, name] of [
    [1_000_000_000_000, 'trillion'],
    [1_000_000_000, 'billion'],
    [1_000_000, 'million'],
    [1_000, 'thousand'],
    [100, 'hundred'],
  ] as const) {
    if (value >= scale) {
      const remainder = value % scale;
      return (
        `${integerToEnglishText(Math.floor(value / scale))} ${name}` +
        (remainder ? ` ${integerToEnglishText(remainder)}` : '')
      );
    }
  }
  return '';
};

export const amountToEnglishText = (amount: number): string => {
  const totalMongo = Number.isFinite(amount)
    ? Math.round(Math.abs(amount) * 100)
    : 0;
  const tugrug = Math.floor(totalMongo / 100);
  const mongo = totalMongo % 100;
  const sign = amount < 0 && totalMongo > 0 ? 'minus ' : '';
  const amountText = `${integerToEnglishText(tugrug)} ${
    tugrug === 1 ? 'tugrik' : 'tugriks'
  }`;
  return (
    `${sign}${amountText}` +
    (mongo > 0 ? ` and ${integerToEnglishText(mongo)} mongo` : '')
  );
};

export const amountToText = (amount: number): string => {
  const language = getI18n()?.resolvedLanguage ?? getI18n()?.language;
  return language?.startsWith('en')
    ? amountToEnglishText(amount)
    : amountToMongolianText(amount);
};
