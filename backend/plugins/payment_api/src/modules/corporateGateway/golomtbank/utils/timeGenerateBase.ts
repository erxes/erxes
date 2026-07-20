import { createHmac } from 'crypto';

const DEFAULT_TIME_STEP_SECONDS = 30;
let NUM_DIGITS_OUTPUT = 6;
const blockOfZeros = '000000';

export function generateCurrentNumberString(base32Secret: string): string {
  return generateNumberString(
    base32Secret,
    Date.now(),
    DEFAULT_TIME_STEP_SECONDS,
  );
}

function generateNumberString(
  base32Secret: string,
  timeMillis: number,
  timeStepSeconds: number,
): string {
  const number = generateNumber(base32Secret, timeMillis, timeStepSeconds);
  return zeroPrepend(number, NUM_DIGITS_OUTPUT);
}

function generateNumber(
  base32Secret: string,
  timeMillis: number,
  timeStepSeconds: number,
): number {
  const key = decodeBase32(base32Secret);
  const data = Buffer.alloc(8);
  let value = Math.floor(timeMillis / 1000 / timeStepSeconds);

  let i = 7;
  while (value > 0) {
    data[i] = value & 0xff;
    value >>= 8;
    i--;
  }
  const signKey = Buffer.from(key);
  const hmac = createHmac('sha1', signKey);
  hmac.update(data);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  let truncatedHash = 0;
  for (let i = offset; i < offset + 4; i++) {
    truncatedHash <<= 8;
    truncatedHash |= hash[i];
  }

  truncatedHash &= 0x7fffffff;
  truncatedHash %= 1000000;

  return truncatedHash;
}

function zeroPrepend(num: number, digits: number): string {
  const numStr = String(num);
  if (numStr.length >= digits) {
    return numStr;
  }

  const zeroCount = digits - numStr.length;
  return blockOfZeros.slice(0, zeroCount) + numStr;
}

function decodeBase32(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const charmap = new Map(Array.from(alphabet).map((c, i) => [c, i]));

  const numBytes = Math.ceil((str.length * 5) / 8);
  const result = new Uint8Array(numBytes);
  let resultIndex = 0;
  let which = 0;
  let working = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charAt(i).toUpperCase();
    const val = charmap.get(ch);

    if (val === undefined) {
      throw new Error(`Invalid base-32 character: ${ch}`);
    }

    switch (which) {
      case 0:
        working = (val & 31) << 3;
        which = 1;
        break;
      case 1:
        working |= (val & 28) >> 2;
        result[resultIndex++] = working;
        working = (val & 3) << 6;
        which = 2;
        break;
      case 2:
        working |= (val & 31) << 1;
        which = 3;
        break;
      case 3:
        working |= (val & 16) >> 4;
        result[resultIndex++] = working;
        working = (val & 15) << 4;
        which = 4;
        break;
      case 4:
        working |= (val & 30) >> 1;
        result[resultIndex++] = working;
        working = (val & 1) << 7;
        which = 5;
        break;
      case 5:
        working |= (val & 31) << 2;
        which = 6;
        break;
      case 6:
        working |= (val & 24) >> 3;
        result[resultIndex++] = working;
        working = (val & 7) << 5;
        which = 7;
        break;
      case 7:
        working |= val & 31;
        result[resultIndex++] = working;
        which = 0;
        break;
    }
  }

  if (which !== 0) {
    result[resultIndex++] = working;
  }

  return result;
}
