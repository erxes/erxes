const DIGITS = [
  { word: "тэг" },
  { word: "нэг", prefix: "нэгэн" },
  { word: "хоёр" },
  { word: "гурав", prefix: "гурван" },
  { word: "дөрөв", prefix: "дөрвөн" },
  { word: "тав", prefix: "таван" },
  { word: "зургаа", prefix: "зургаан" },
  { word: "долоо", prefix: "долоон" },
  { word: "найм", prefix: "найман" },
  { word: "ес", prefix: "есөн" },
];

const TENS = [
  { word: "арав", prefix: "арван" },
  { word: "хорь", prefix: "хорин" },
  { word: "гуч", prefix: "гучин" },
  { word: "дөч", prefix: "дөчин" },
  { word: "тавь", prefix: "тавин" },
  { word: "жар", prefix: "жаран" },
  { word: "дал", prefix: "далан" },
  { word: "ная", prefix: "наян" },
  { word: "ер", prefix: "ерэн" },
];

const SCALES = [
  { word: "зуу", prefix: "зуун" },
  { word: "мянга" },
  { word: "сая" },
  { word: "тэр бум" },
  { word: "их наяд" },
];

const runner = (num: number, usePrefix = false): string => {
  if (num === 0) return DIGITS[0].word;

  if (num < 10) {
    // 1, 2, 3, 4, 5, 6, 7, 8, 9
    return usePrefix
      ? DIGITS[num].prefix ?? DIGITS[num].word
      : DIGITS[num].word;
  }

  if (num < 100) {
    // 10 - 99
    const quotient = Math.floor(num / 10); // 1#, 2#, 3#, 4#, 5#, 6#, 7#, 8#, 9#
    const remainder = num % 10; // #1, #2, #3, #4, #5, #6, #7, #8, #9

    if (remainder === 0) {
      // 10, 20, 30, 40, 50, 60, 70, 80, 90
      return usePrefix ? TENS[quotient - 1].prefix : TENS[quotient - 1].word;
    }

    return `${TENS[quotient - 1].prefix} ${usePrefix
        ? DIGITS[remainder].prefix ?? DIGITS[remainder].word
        : DIGITS[remainder].word
      }`;
  }

  if (num < 1_000) {
    // 100 - 999
    const quotient = Math.floor(num / 100); // 1#, 2#, 3#, 4#, 5#, 6#, 7#, 8#, 9#
    const remainder = num % 100; // ##, ##, ##, ##, ##, ##, ##, ##, ##

    if (remainder === 0) {
      // 100, 200, 300, 400, 500, 600, 700, 800, 900
      return `${quotient === 1
          ? DIGITS[quotient].word
          : DIGITS[quotient].prefix ?? DIGITS[quotient].word
        } ${usePrefix ? SCALES[0].prefix ?? SCALES[0].word : SCALES[0].word}`;
    }

    return `${quotient === 1
        ? DIGITS[quotient].word
        : DIGITS[quotient].prefix ?? DIGITS[quotient].word
      } ${SCALES[0].prefix} ${runner(remainder, usePrefix)}`;
  }

  for (let i = SCALES.length - 1; i >= 1; i--) {
    const scaleValue = 10 ** (i * 3); // 1_000, 1_000_000, ...

    if (num >= scaleValue) {
      const quotient = Math.floor(num / scaleValue);
      const remainder = num % scaleValue;

      if (remainder === 0) {
        return `${runner(quotient, quotient !== 1)} ${SCALES[i].word}`;
      }

      return `${runner(quotient, quotient !== 1)} ${SCALES[i].word
        } ${runner(remainder)}`;
    }
  }

  return "Number is too large";
};

const numberToWord = (num: number): string => {
  if (num > 1_000_000_000_000_000) {
    throw new Error("Number is too large");
  }

  return runner(num, false);
};

export { numberToWord };
