import * as cheerio from 'cheerio';
import { IModels } from './connectionResolver';

const findByRegex = (reg, content) => {
  const regex = new RegExp(reg, 'g');
  return content.match(regex) || [];
};

const findCellInTable = (html, row, column) => {
  const $ = cheerio.load(html);

  const results = $('table tbody')
    .find(`tr:nth-child(${row})`)
    .find(`td:nth-child(${column})`);

  if (results.length === 1) {
    return $(results[0]).text();
  }

  return '';
};

export const calculateDynamicValue = async (models: IModels, report) => {
  const results = findByRegex(new RegExp(/{dynamic: .+}/, 'g'), report.content);

  for (const result of results || []) {
    let expression = result.replace('{dynamic: ', '');
    expression = expression.replace('}', '');

    const subResults = findByRegex(new RegExp(/\w+:\d+:\d+/, 'g'), expression);

    for (const subResult of subResults) {
      const parts = subResult.split(':');

      if (parts.length === 3) {
        const [code, row, column] = parts;

        const subReport = await models.Reports.findOne({ code });

        let foundValue;

        if (subReport) {
          foundValue = findCellInTable(subReport.content, row, column);
        }

        if (foundValue) {
          expression = expression.replace(subResult, foundValue);
        }
      }
    }

    console.log('mmmmmmmmmmmm', expression);
  }
};
