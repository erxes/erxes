import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionLinkValue,
} from 'ui-modules';

/** RFC 4180 parsing: quoted fields, doubled quotes, commas and newlines inside quotes. */
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const source = text.replace(/^﻿/, '');

  for (let index = 0; index < source.length; index++) {
    const char = source[index];

    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') {
        index++;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((value) => value.trim()));
};

/**
 * Cells that start with =, +, - or @ are prefixed so spreadsheets do not
 * run them as formulas when the file is opened.
 */
const escapeCell = (value: string) => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const toCsv = (rows: string[][]) =>
  `﻿${rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')}\r\n`;

const LIST_SEPARATOR = ';';

/** A stored value as one cell, in the form `fromCsvValue` reads back. */
export const toCsvValue = (
  field: IDataExtensionField,
  value: DataExtensionValue | undefined,
): string => {
  if (value === null || value === undefined) {
    return '';
  }

  switch (field.type) {
    case 'currency': {
      const { amount, currency } = value as { amount: number; currency: string };

      return `${amount} ${currency}`;
    }
    case 'links':
      return (value as IDataExtensionLinkValue[]).map((link) => link.url).join(LIST_SEPARATOR);
    case 'address':
    case 'fullName':
    case 'files':
    case 'json':
      return JSON.stringify(value);
    default:
      return Array.isArray(value) ? value.join(LIST_SEPARATOR) : String(value);
  }
};

const splitList = (text: string) =>
  text
    .split(LIST_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);

const TRUE_WORDS = ['true', 'yes', '1', 'тийм', 'y'];
const FALSE_WORDS = ['false', 'no', '0', 'үгүй', 'n'];

/**
 * One CSV cell as a value for `field`. Throws with a readable reason when
 * the text cannot be read; the server still validates whatever is sent.
 */
export const fromCsvValue = (
  field: IDataExtensionField,
  raw: string,
): DataExtensionValue | undefined => {
  // Undo the formula guard `toCsv` adds to cells such as "-5".
  const text = raw.trim().replace(/^'(?=[=+\-@])/, '');

  if (!text) {
    return undefined;
  }

  const option = (candidate: string) => {
    const lower = candidate.toLowerCase();
    const match = (field.options || []).find(
      (item) => item.value.toLowerCase() === lower || item.label.toLowerCase() === lower,
    );

    if (!match) {
      throw new Error(`"${candidate}" is not an option of ${field.label}`);
    }

    return match.value;
  };

  const number = (candidate: string) => {
    const parsed = Number(candidate.replace(/[\s,]/g, ''));

    if (!Number.isFinite(parsed)) {
      throw new Error(`"${candidate}" is not a number`);
    }

    return parsed;
  };

  switch (field.type) {
    case 'number':
    case 'percent':
      return number(text.replace(/%$/, ''));
    case 'rating':
      return Math.round(number(text));
    case 'currency': {
      const code = text.match(/[A-Za-z]{3}/)?.[0]?.toUpperCase();

      return {
        amount: number(text.replace(/[A-Za-z₮$€¥£]/g, '')),
        currency: code || field.settings?.currency || 'MNT',
      };
    }
    case 'boolean': {
      const lower = text.toLowerCase();

      if (TRUE_WORDS.includes(lower)) return true;
      if (FALSE_WORDS.includes(lower)) return false;
      throw new Error(`"${text}" is not yes or no`);
    }
    case 'date':
    case 'dateTime': {
      const date = new Date(text);

      if (Number.isNaN(date.getTime())) {
        throw new Error(`"${text}" is not a date`);
      }

      return date.toISOString();
    }
    case 'select':
      return option(text);
    case 'multiSelect':
      return splitList(text).map(option);
    case 'emails':
    case 'phones':
      return splitList(text);
    case 'links':
      return splitList(text).map((url) => ({ url }));
    case 'member':
      return field.settings?.multiple ? splitList(text) : text;
    case 'relation':
      return field.relation?.kind === 'manyToMany' ? splitList(text) : text;
    case 'address':
      return text.startsWith('{') ? JSON.parse(text) : { street: text };
    case 'fullName': {
      if (text.startsWith('{')) return JSON.parse(text);
      const [firstName, ...rest] = text.split(/\s+/);
      return { firstName, ...(rest.length ? { lastName: rest.join(' ') } : {}) };
    }
    case 'files':
    case 'json':
      return JSON.parse(text);
    default:
      return text;
  }
};
