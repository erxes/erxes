import { ImportHeaderDefinition } from '../types';
import { matchImportHeaders, normalizeHeader } from './headerMatcher';

const SYSTEM_FIELDS: ImportHeaderDefinition[] = [
  { label: 'First Name', key: 'firstName' },
  { label: 'Last Name', key: 'lastName' },
  { label: 'Email', key: 'primaryEmail' },
  { label: 'Phone', key: 'primaryPhone' },
  { label: 'Code', key: 'code' },
];

const repeatingField = (rowIndex: number): ImportHeaderDefinition => ({
  label: `Address ${rowIndex} / Street [street#${rowIndex}]`,
  key: `propertiesData.g:group1/field1#${rowIndex}`,
  aliases: [`Address ${rowIndex} / Street`],
  type: 'customProperty',
  code: 'street',
  rowIndex,
});

describe('normalizeHeader', () => {
  it('folds away case, punctuation and bracketed codes', () => {
    expect(normalizeHeader('  First_Name  ')).toBe('first name');
    expect(normalizeHeader('Street [street#2]')).toBe('street');
  });

  it('keeps non-latin scripts intact', () => {
    expect(normalizeHeader('  Нэр,  Овог ')).toBe('нэр овог');
  });
});

describe('matchImportHeaders', () => {
  it('matches labels and keys exactly', () => {
    const [label, key] = matchImportHeaders(
      ['First Name', 'primaryEmail'],
      SYSTEM_FIELDS,
    );

    expect(label).toMatchObject({ key: 'firstName', status: 'matched' });
    expect(key).toMatchObject({ key: 'primaryEmail', status: 'matched' });
  });

  it('matches through case and punctuation differences', () => {
    const [match] = matchImportHeaders(['first_name'], SYSTEM_FIELDS);

    expect(match).toMatchObject({ key: 'firstName', status: 'matched' });
  });

  it('only suggests a near miss instead of wiring it up', () => {
    const [match] = matchImportHeaders(['Frist Name'], SYSTEM_FIELDS);

    expect(match.status).toBe('suggested');
    expect(match.key).toBe('firstName');
  });

  it('leaves an unrelated header unmatched', () => {
    const [match] = matchImportHeaders(['Legacy Id'], SYSTEM_FIELDS);

    expect(match).toMatchObject({ status: 'unmatched', key: undefined });
  });

  it('keeps repeating property rows apart', () => {
    const [first, second] = matchImportHeaders(
      ['Address 1 / Street [street#1]', 'Address 2 / Street [street#2]'],
      [repeatingField(1), repeatingField(2)],
    );

    expect(first.key).toBe('propertiesData.g:group1/field1#1');
    expect(second.key).toBe('propertiesData.g:group1/field1#2');
  });

  it('sends a code without a row to the first row', () => {
    const [match] = matchImportHeaders(
      ['Street [street]'],
      [repeatingField(1), repeatingField(2)],
    );

    expect(match.key).toBe('propertiesData.g:group1/field1#1');
  });

  it('claims a target field once and reports the duplicate', () => {
    const [first, second] = matchImportHeaders(
      ['Email', 'e-mail'],
      SYSTEM_FIELDS,
    );

    expect(first).toMatchObject({ key: 'primaryEmail', status: 'matched' });
    expect(second).toMatchObject({ key: undefined, status: 'unmatched' });
  });
});
