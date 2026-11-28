import type { LANGUAGES } from '@erxes/core-db/enums';

/** What a portal's code email and text may say: the code, how long it works, the portal. */
export interface CodeMessageValues {
  code: string;
  minutes: number;
  portal: string;
}

export interface CodeMessages {
  emailSubject: string;
  /** Paragraphs split by a blank line. */
  emailBody: string;
  sms: string;
}

/**
 * The code email and text a portal sends until it writes its own (Settings › Portals), in the
 * portal's `codeLanguage`. `{code}`, `{minutes}` and `{portal}` are filled in.
 */
export const DEFAULT_CODE_MESSAGES: Record<(typeof LANGUAGES)[number], CodeMessages> = {
  en: {
    emailSubject: '{code} is your {portal} code',
    emailBody:
      "Enter this code to sign in to {portal}. It works once, for {minutes} minutes.\n\nIf you didn't ask for it, ignore this email: nobody can sign in without the code.",
    sms: '{code} is your {portal} code. It works for {minutes} minutes.',
  },
  mn: {
    emailSubject: '{portal}: таны код {code}',
    emailBody:
      '{portal}-д нэвтрэхийн тулд энэ кодыг оруулна уу. Нэг удаа, {minutes} минутын турш ажиллана.\n\nХэрэв та код хүсээгүй бол энэ имэйлийг үл тоомсорлоно уу: кодгүйгээр хэн ч нэвтрэхгүй.',
    sms: '{portal}: таны код {code}. {minutes} минут ажиллана.',
  },
};

/** A code message with its values filled in. */
export const fillCodeMessage = (template: string, values: CodeMessageValues) =>
  template
    .replaceAll('{code}', values.code)
    .replaceAll('{minutes}', String(values.minutes))
    .replaceAll('{portal}', values.portal);
