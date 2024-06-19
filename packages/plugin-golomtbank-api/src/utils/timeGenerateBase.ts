import * as CryptoJS from "crypto-js";

class TimeBasedOneTimePasswordUtil {
  static readonly DEFAULT_TIME_STEP_SECONDS = 30;
  private static readonly NUM_DIGITS_OUTPUT = 6;
  private static readonly blockOfZeros = "000000";

  static generateBase32Secret(length = 16): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * 32);
      secret += chars[randomIndex];
    }
    return secret;
  }

  static validateCurrentNumber(
    base32Secret: string,
    authNumber: number,
    windowMillis: number,
    timeMillis = Date.now(),
    timeStepSeconds = 30
  ): boolean {
    const fromTimeMillis = timeMillis - windowMillis;
    const toTimeMillis = timeMillis + windowMillis;
    const timeStepMillis = timeStepSeconds * 1000;

    for (
      let millis = fromTimeMillis;
      millis <= toTimeMillis;
      millis += timeStepMillis
    ) {
      const generatedNumber = this.generateNumber(
        base32Secret,
        millis,
        timeStepSeconds
      );
      if (generatedNumber === authNumber) {
        return true;
      }
    }
    return false;
  }

  static generateCurrentNumberString(base32Secret: string): string {
    return this.generateNumberString(base32Secret, Date.now(), 30);
  }

  static generateNumberString(
    base32Secret: string,
    timeMillis: number,
    timeStepSeconds: number
  ): string {
    const number = this.generateNumber(
      base32Secret,
      timeMillis,
      timeStepSeconds
    );
    return this.zeroPrepend(number, this.NUM_DIGITS_OUTPUT);
  }

  static generateCurrentNumber(base32Secret: string): number {
    return this.generateNumber(base32Secret, Date.now(), 30);
  }

  static generateNumber(
    base32Secret: string,
    timeMillis: number,
    timeStepSeconds: number
  ): number {
    const key = this.decodeBase32(base32Secret);
    const data = new Uint8Array(8);
    let value = Math.floor(timeMillis / 1000 / timeStepSeconds);

    for (let i = 7; value > 0; --i) {
      data[i] = value & 0xff;
      value >>= 8;
    }

    const hmac = CryptoJS.HmacSHA1(
      CryptoJS.lib.WordArray.create(data as any),
      CryptoJS.enc.Base64.parse(
        CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.create(key as any))
      )
    );
    const hash = hmac.words;
    const offset = hash[hash.length - 1] & 0xf;

    let truncatedHash = 0;
    for (let i = 0; i < 4; ++i) {
      truncatedHash <<= 8;
      truncatedHash |= (hash[offset + i] >> 24) & 0xff;
    }
    truncatedHash &= 0x7fffffff;
    truncatedHash %= 1000000;

    return truncatedHash;
  }

  static zeroPrepend(num: number, digits: number): string {
    const numStr = num.toString();
    if (numStr.length >= digits) {
      return numStr;
    }
    return this.blockOfZeros.slice(0, digits - numStr.length) + numStr;
  }

  static decodeBase32(str: string): Uint8Array {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits: any = 0;
    let value: any = 0;
    const result: any[] = [];

    for (let i = 0; i < str.length; i++) {
      const idx = alphabet.indexOf(str.charAt(i).toUpperCase());
      if (idx === -1) {
        throw new Error("Invalid base-32 character: " + str.charAt(i));
      }
      value = (value << 5) | idx;
      bits += 5;

      if (bits >= 8) {
        result.push((value >> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }

    return new Uint8Array(result);
  }
}

export default TimeBasedOneTimePasswordUtil;
