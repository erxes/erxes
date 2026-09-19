const NUMERIC_SUFFIX_PATTERN = /\d+$/;

export const getNextProductCode = (code?: string | null): string => {
  if (!code) {
    return '';
  }

  const numericSuffix = code.match(NUMERIC_SUFFIX_PATTERN)?.[0];

  if (numericSuffix) {
    const nextSuffix = (BigInt(numericSuffix) + 1n)
      .toString()
      .padStart(numericSuffix.length, '0');

    return `${code.slice(0, -numericSuffix.length)}${nextSuffix}`;
  }

  const characters = Array.from(code);
  const lastCharacter = characters.at(-1);
  const lastCodePoint = lastCharacter?.codePointAt(0);

  if (lastCodePoint === undefined || lastCodePoint >= 0x10ffff) {
    return '';
  }

  characters[characters.length - 1] = String.fromCodePoint(lastCodePoint + 1);

  return characters.join('');
};
