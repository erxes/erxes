import { en } from './dictionaries/en';
import { mn } from './dictionaries/mn';
import type { Locale } from './locales';

export type MessageKey = keyof typeof en;

export type Dictionary = Record<MessageKey, string>;

export type MessageVars = Record<string, string | number>;

export type Translate = (key: MessageKey, vars?: MessageVars) => string;

const dictionaries: Record<Locale, Dictionary> = { en, mn };

const fill = (template: string, vars?: MessageVars): string =>
  vars
    ? template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in vars ? String(vars[name]) : match,
      )
    : template;

export const createTranslate = (locale: Locale): Translate => {
  const dictionary = dictionaries[locale];

  return (key, vars) => {
    const singular = `${key}_one`;
    const template =
      vars?.count === 1 && singular in dictionary
        ? dictionary[singular as MessageKey]
        : dictionary[key];

    return fill(template, vars);
  };
};
