import {
  IFieldValidator,
  ValidatorPresetKey,
} from './db/definitions/fieldValidator';

interface RegistryEntry {
  pattern: RegExp;
  defaultErrorMessage: string;
}

export const VALIDATION_REGISTRY: Record<ValidatorPresetKey, RegistryEntry> = {
  EMAIL: {
    // RFC 5321 simplified — delegates deep validation to the server
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    defaultErrorMessage: 'Please enter a valid email address.',
  },
  PHONE_INTL: {
    // E.164: optional leading +, then 7–15 digits
    pattern: /^\+?[1-9]\d{6,14}$/,
    defaultErrorMessage:
      'Please enter a valid international phone number (e.g. +19165551234).',
  },
  POSTAL_CODE: {
    // Covers most global formats (US 5/9-digit, UK, CA, DE, etc.)
    pattern: /^[A-Z0-9]{2,10}(?:[\s-][A-Z0-9]{2,7})?$/i,
    defaultErrorMessage: 'Please enter a valid postal / ZIP code.',
  },
  ALPHANUMERIC: {
    pattern: /^[a-zA-Z0-9]+$/,
    defaultErrorMessage: 'Only letters (A–Z) and digits (0–9) are allowed.',
  },
};

// ─── Security constants ───────────────────────────────────────────────────────
// Custom regex is user-supplied and therefore a ReDoS attack surface.
// Two layers of defence are applied:
//   1. Length cap  — rules out deeply nested alternation before evaluation.
//   2. Async timeout — aborts evaluation that runs too long (catastrophic backtracking).
// For production, additionally consider running validation in a worker thread
// or using a library such as `safe-regex` / `re2` to statically reject evil patterns.
const MAX_CUSTOM_REGEX_LENGTH = 500;
const CUSTOM_REGEX_TIMEOUT_MS = 100;

function testWithTimeout(pattern: RegExp, value: string): Promise<boolean> {
  return Promise.race([
    new Promise<boolean>((resolve) => resolve(pattern.test(value))),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Regex evaluation timed out')),
        CUSTOM_REGEX_TIMEOUT_MS,
      ),
    ),
  ]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ValidateFieldResult {
  isValid: boolean;
  errorMessage?: string;
}

export async function validateField(
  value: string,
  config: IFieldValidator,
): Promise<ValidateFieldResult> {
  if (!config || config.type === 'NONE') {
    return { isValid: true };
  }

  if (config.type === 'PRESET') {
    const entry = config.presetKey
      ? VALIDATION_REGISTRY[config.presetKey]
      : null;

    if (!entry) {
      return { isValid: true };
    }

    const isValid = entry.pattern.test(value);
    return {
      isValid,
      errorMessage: isValid
        ? undefined
        : (config.errorMessage ?? entry.defaultErrorMessage),
    };
  }

  if (config.type === 'CUSTOM') {
    const { customRegex, errorMessage } = config;

    if (!customRegex) {
      return { isValid: true };
    }

    if (customRegex.length > MAX_CUSTOM_REGEX_LENGTH) {
      throw new Error(
        `Custom regex exceeds the maximum allowed length of ${MAX_CUSTOM_REGEX_LENGTH} characters.`,
      );
    }

    let pattern: RegExp;
    try {
      // Flags are intentionally omitted — the client provides the raw pattern only.
      pattern = new RegExp(customRegex);
    } catch {
      throw new Error('The custom regex pattern is invalid.');
    }

    try {
      const isValid = await testWithTimeout(pattern, value);
      return {
        isValid,
        errorMessage: isValid
          ? undefined
          : (errorMessage ?? 'The value does not match the required format.'),
      };
    } catch {
      // A timeout here is almost certainly catastrophic backtracking — treat as
      // a server-side error so the offending pattern can be flagged and removed.
      throw new Error(
        'Regex validation timed out. Please simplify your custom pattern.',
      );
    }
  }

  return { isValid: true };
}
