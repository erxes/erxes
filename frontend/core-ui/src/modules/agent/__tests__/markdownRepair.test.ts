import { repairTables } from '../components/markdownRepair';

const SCREENSHOT_INPUT = [
  '| Pipeline Stage | Leads | Conversion Rate | Potential Value |  |  |  |  |',
  '| New leads | 1,250 | — | $1,875,000 |  |  |  |  |',
  '| Qualified leads | 480 | 38.4% | $720,000 |  | Demo scheduled | 215 | 44.8% | $430,000 |  | Proposal sent | 96 | 44.7% | $240,000 |  |',
  '| Closed-won | 42 | 43.8% | $126,000 |  |',
].join('\n');

// The latest screenshot: a separator row is present but every data line
// has been collapsed onto one mega-line.
const COMPANIES_INPUT = [
  '| Company | Industry | Size | Website | Account Status |',
  '|---|---|--:|---|---|---|',
  '| Northstar Analytics | Technology | 51–200 | northstaranalytics.example | Prospect || Lumen Retail Group | Retail | 201–500 | lumenretail.example | Customer || Harbor Health Systems | Healthcare | 501–1,000 | harborhealth.example | Customer || Cedar & Stone Hotels | Hospitality | 51–200 | cedarstone.example | Prospect || Vertex Logistics | Transportation | 201–500 | vertexlogistics.example | Customer || BrightPath Education | Education | 51–200 | brightpathedu.example | Prospect || Atlas Financial Partners | Finance | 51–200 | atlasfinancial.example | Customer || Mosaic Media Co. | Media | 11–50 | mosaicmedia.example | Prospect || GreenGrid Energy | Energy | 201–500 | greengridenergy.example | Customer || Cloudline Manufacturing | Manufacturing | 501–1,000 | cloudline.example | Prospect |',
].join('\n');

// Latest screenshot: the separator row is merged onto the END of the header
// line (`| A | B |---|---|---|`) and the run is wider than the header. The
// dashes must not be counted as header columns — doing so made every data
// row below re-chunk into 5-column garbage.
const MERGED_SEPARATOR_INPUT = [
  '| Үзүүлэлт | Дүн |---|---|---|',
  '| Нийт хэлцэл | 160 |',
  '| Нийт борлуулалтын дүн | 25,543,809 MNT |',
  '| Дүнтэй хэлцэл | 47 |',
  '| Дүнгүй хэлцэл | 113 |',
  '| Active хэлцэл | 135 |',
  '| Archived хэлцэл | 25 |',
  '| Complete гэж тэмдэглэгдсэн | 0 |',
].join('\n');

describe('repairTables', () => {
  it('passes a well-formed GFM table through unchanged', () => {
    const input = [
      '| Name | Qty |',
      '| --- | ---: |',
      '| Widget | 4 |',
      '| Sprocket | 7 |',
    ].join('\n');

    expect(repairTables(input)).toBe(input);
  });

  it('inserts a missing separator row', () => {
    const input = ['| Name | Qty |', '| Widget | 4 |'].join('\n');

    expect(repairTables(input)).toBe(
      ['| Name | Qty |', '| --- | --- |', '| Widget | 4 |'].join('\n'),
    );
  });

  it('re-chunks a collapsed multi-row line into separate rows', () => {
    // Mirrors the screenshot: three logical rows concatenated onto one line
    // with empty cells as the leftover row separators.
    const output = repairTables(SCREENSHOT_INPUT);

    const lines = output.split('\n');

    expect(lines).toHaveLength(7);
    expect(lines[0]).toBe('| Pipeline Stage | Leads | Conversion Rate | Potential Value |');
    expect(lines[1]).toBe('| --- | --- | --- | --- |');
    expect(lines[2]).toBe('| New leads | 1,250 | — | $1,875,000 |');
    expect(lines[3]).toBe('| Qualified leads | 480 | 38.4% | $720,000 |');
    expect(lines[4]).toBe('| Demo scheduled | 215 | 44.8% | $430,000 |');
    expect(lines[5]).toBe('| Proposal sent | 96 | 44.7% | $240,000 |');
    expect(lines[6]).toBe('| Closed-won | 42 | 43.8% | $126,000 |');
  });

  it('re-chunks even when the trailing row only partially fills the column count', () => {
    const input = [
      '| Stage | Leads | Value |',
      '| New leads | 1,250 | $1,875,000 |  |  |',
      '| Closed-won | 42 | $126,000 |',
    ].join('\n');

    const output = repairTables(input);

    expect(output).toBe(
      [
        '| Stage | Leads | Value |',
        '| --- | --- | --- |',
        '| New leads | 1,250 | $1,875,000 |',
        '| Closed-won | 42 | $126,000 |',
      ].join('\n'),
    );
  });

  it('leaves prose with a single stray pipe alone', () => {
    const input = 'Use the `|` character to separate columns.';

    expect(repairTables(input)).toBe(input);
  });

  it('leaves fenced code blocks with pipes alone', () => {
    const input = [
      'Here is some text:',
      '',
      '```',
      '| a | b |',
      '| --- | --- |',
      '| 1 | 2 |',
      '```',
      '',
      'And some more text after.',
    ].join('\n');

    expect(repairTables(input)).toBe(input);
  });

  it('preserves paragraphs around a repaired table', () => {
    const input = [
      'Some intro paragraph.',
      '',
      '| A | B |',
      '| 1 | 2 |',
      '| 3 | 4 |',
      '',
      'A paragraph after.',
    ].join('\n');

    expect(repairTables(input)).toBe(
      [
        'Some intro paragraph.',
        '',
        '| A | B |',
        '| --- | --- |',
        '| 1 | 2 |',
        '| 3 | 4 |',
        '',
        'A paragraph after.',
      ].join('\n'),
    );
  });

  it('splits a collapsed mega-line even when a separator row is present', () => {
    // Mirrors the latest screenshot: the assistant emitted a header, a
    // separator, and a single line that contains every data row jammed
    // together. The block must NOT be treated as already well-formed just
    // because the separator row exists.
    const output = repairTables(COMPANIES_INPUT);

    const lines = output.split('\n');

    expect(lines).toHaveLength(12);
    expect(lines[0]).toBe('| Company | Industry | Size | Website | Account Status |');
    expect(lines[1]).toBe('|---|---|--:|---|---|---|');
    expect(lines[2]).toBe('| Northstar Analytics | Technology | 51–200 | northstaranalytics.example | Prospect |');
    expect(lines[3]).toBe('| Lumen Retail Group | Retail | 201–500 | lumenretail.example | Customer |');
    expect(lines[4]).toBe('| Harbor Health Systems | Healthcare | 501–1,000 | harborhealth.example | Customer |');
    expect(lines[5]).toBe('| Cedar & Stone Hotels | Hospitality | 51–200 | cedarstone.example | Prospect |');
    expect(lines[6]).toBe('| Vertex Logistics | Transportation | 201–500 | vertexlogistics.example | Customer |');
    expect(lines[7]).toBe('| BrightPath Education | Education | 51–200 | brightpathedu.example | Prospect |');
    expect(lines[8]).toBe('| Atlas Financial Partners | Finance | 51–200 | atlasfinancial.example | Customer |');
    expect(lines[9]).toBe('| Mosaic Media Co. | Media | 11–50 | mosaicmedia.example | Prospect |');
    expect(lines[10]).toBe('| GreenGrid Energy | Energy | 201–500 | greengridenergy.example | Customer |');
    expect(lines[11]).toBe('| Cloudline Manufacturing | Manufacturing | 501–1,000 | cloudline.example | Prospect |');
  });

  it('preserves the alignment markers in an existing separator row', () => {
    const input = [
      '| Name | Qty |',
      '| --- | ---: |',
      '| Widget | 4 |',
    ].join('\n');

    expect(repairTables(input)).toBe(input);
  });

  it('splits a separator row merged onto the end of the header line', () => {
    const output = repairTables(MERGED_SEPARATOR_INPUT);

    expect(output).toBe(
      [
        '| Үзүүлэлт | Дүн |',
        '| --- | --- |',
        '| Нийт хэлцэл | 160 |',
        '| Нийт борлуулалтын дүн | 25,543,809 MNT |',
        '| Дүнтэй хэлцэл | 47 |',
        '| Дүнгүй хэлцэл | 113 |',
        '| Active хэлцэл | 135 |',
        '| Archived хэлцэл | 25 |',
        '| Complete гэж тэмдэглэгдсэн | 0 |',
      ].join('\n'),
    );
  });

  it('keeps alignment markers from a merged separator that matches the header width', () => {
    const input = ['| Name | Qty |---|---:|', '| Widget | 4 |'].join('\n');

    expect(repairTables(input)).toBe(
      ['| Name | Qty |', '| --- | ---: |', '| Widget | 4 |'].join('\n'),
    );
  });

  it('does not mistake a single trailing dash cell for a merged separator', () => {
    const input = ['| Stage | Note |', '| Closed | --- |'].join('\n');

    expect(repairTables(input)).toBe(
      ['| Stage | Note |', '| --- | --- |', '| Closed | --- |'].join('\n'),
    );
  });
});