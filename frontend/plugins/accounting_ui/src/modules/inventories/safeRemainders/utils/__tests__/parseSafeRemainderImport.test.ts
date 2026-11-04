import {
  mapSafeRemainderCsv,
  parseSafeRemainderText,
  previewSafeRemainderCsv,
  suggestSafeRemainderCsvMapping,
} from '@/inventories/safeRemainders/utils/parseSafeRemainderImport';

jest.mock('csv-parse/browser/esm/sync', () =>
  jest.requireActual('csv-parse/sync'),
);
jest.mock('react-i18next', () => ({ getI18n: () => undefined }));

const parseCsv = (text: string) => {
  const preview = previewSafeRemainderCsv(text);
  return mapSafeRemainderCsv(
    preview,
    suggestSafeRemainderCsvMapping(preview.headers),
  );
};

describe('safe remainder CSV column mapping', () => {
  it('automatically maps the counting CSV Unit Price header', () => {
    const preview = previewSafeRemainderCsv(
      'Code,Unit Price,count,isSale,totalCost\n001,150,2,true,100',
    );
    const mapping = suggestSafeRemainderCsvMapping(preview.headers);
    expect(mapping).toEqual([
      'productCode',
      'unitPrice',
      'count',
      'isSale',
      'totalCost',
    ]);
    expect(mapSafeRemainderCsv(preview, mapping)[0].trInfo?.unitPrice).toBe(
      150,
    );
  });

  it('matches spaces, underscores and hyphens in field names and aliases', () => {
    expect(
      suggestSafeRemainderCsvMapping([
        'Product Code',
        ' UNIT_PRICE ',
        'total-cost',
        'is_sale',
        'trInfo.Unit Price',
      ]),
    ).toEqual(['productCode', 'unitPrice', 'totalCost', 'isSale', 'unitPrice']);
  });

  it('maps arbitrary reordered headers and ignores unrelated input', () => {
    const preview = previewSafeRemainderCsv(
      '\uFEFFQuantity,Description,SKU,Sale,Cost,Price\r\n2,"item, name",001,true,0,150\r\n',
    );
    expect(
      mapSafeRemainderCsv(preview, [
        'count',
        '',
        'productCode',
        'isSale',
        'totalCost',
        'unitPrice',
      ]),
    ).toEqual([
      {
        productCode: '001',
        count: 2,
        trInfo: {
          unitCost: 0,
          isCostExplicit: true,
          isSale: true,
          unitPrice: 150,
        },
      },
    ]);
  });

  it('suggests existing aliases without treating activeCost as counted cost', () => {
    expect(
      suggestSafeRemainderCsvMapping([
        ' CODE ',
        'count',
        'trInfo.unitCost',
        'trInfo.isSale',
        'trInfo.unitPrice',
        'activeCost',
      ]),
    ).toEqual(['productCode', 'count', 'totalCost', 'isSale', 'unitPrice', '']);
  });

  it('rejects missing required mappings and duplicate target fields', () => {
    const preview = previewSafeRemainderCsv('a,b,c,d\n001,2,false,3');
    expect(() =>
      mapSafeRemainderCsv(preview, ['productCode', 'count', '', '']),
    ).toThrow();
    expect(() =>
      mapSafeRemainderCsv(preview, ['productCode', 'count', 'isSale', 'count']),
    ).toThrow();
  });

  it('preserves fallback cost and requires a price for sale rows', () => {
    expect(
      parseCsv('productCode,count,totalCost,isSale,unitPrice\n001,10,,false,'),
    ).toEqual([
      {
        productCode: '001',
        count: 10,
        trInfo: {
          unitCost: undefined,
          isCostExplicit: false,
          isSale: false,
          unitPrice: undefined,
        },
      },
    ]);
    expect(() => parseCsv('productCode,count,isSale\n001,10,true')).toThrow(
      'unitPrice',
    );
  });

  it('validates mapped values and rejects malformed rows', () => {
    const preview = previewSafeRemainderCsv(
      'SKU,Quantity,Sale\n001,invalid,false',
    );
    expect(() =>
      mapSafeRemainderCsv(preview, ['productCode', 'count', 'isSale']),
    ).toThrow('count');
    expect(() =>
      previewSafeRemainderCsv('SKU,Quantity\n001,2,extra'),
    ).toThrow();
  });

  it('keeps headerless TXT quantities and product codes unchanged', () => {
    expect(parseSafeRemainderText('001,5\n002,0')).toEqual([
      { productCode: '001', count: 5 },
      { productCode: '002', count: 0 },
    ]);
  });
});
