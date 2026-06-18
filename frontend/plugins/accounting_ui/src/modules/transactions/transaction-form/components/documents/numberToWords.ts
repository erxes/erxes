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

/**
 * Formats an amount as Mongolian text, e.g.
 * 1250.50 => "нэг мянга хоёр зуун тавин төгрөг тавин мөнгө"
 */
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

export default amountToMongolianText;
