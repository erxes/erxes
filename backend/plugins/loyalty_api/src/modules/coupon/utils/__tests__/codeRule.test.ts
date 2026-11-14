import { normalizeCodeRule } from '@/coupon/utils/codeRule';

describe('normalizeCodeRule', () => {
  it('reads the campaign form field names', () => {
    expect(
      normalizeCodeRule({
        codeLength: 10,
        numberOfCodes: 200,
        prefixUppercase: 'VIP',
        postfixUppercase: '26',
        characterSet: '0-9',
        usageLimit: 1,
      }),
    ).toEqual({
      codeLength: 10,
      usageLimit: 1,
      size: 200,
      prefix: 'VIP',
      postfix: '26',
      charSet: ['0-9'],
    });
  });

  it('keeps generator names when both are present', () => {
    expect(
      normalizeCodeRule({ size: 3, numberOfCodes: 200, charSet: ['A-Z'] }),
    ).toMatchObject({ size: 3, charSet: ['A-Z'] });
  });

  it('leaves empty form values to the generator defaults', () => {
    expect(
      normalizeCodeRule({ numberOfCodes: 0, characterSet: '' }),
    ).toMatchObject({ size: undefined, charSet: undefined });
    expect(normalizeCodeRule(undefined)).toMatchObject({ size: undefined });
  });
});
