import { IModels } from './connectionResolver';
import { IPageDocument } from './models/pages';

const entryReplacer = async (
  models: IModels,
  siteId: string,
  page: IPageDocument,
  limit: any,
  skip: any
) => {
  let subHtml = '';

  if (page.name.includes('_entry')) {
    const contentTypeCode = page.name.replace('_entry', '');

    const contentType = await models.ContentTypes.findOne({
      siteId,
      code: contentTypeCode
    });

    const entries = await models.Entries.find({
      contentTypeId: contentType?._id
    })
      .limit(limit)
      .skip(skip);

    for (const entry of entries) {
      let entryHtml = page.html.replace(/{{entry._id}}/g, entry._id);

      for (const evalue of entry.values) {
        const { fieldCode, value } = evalue;

        const target = `{{entry.${fieldCode}}}`;

        entryHtml = entryHtml.replace(new RegExp(target, 'g'), value);
      }

      subHtml += entryHtml + `<style>${page.css}</style>`;
    }
  } else {
    subHtml = `${page.html} <style>${page.css}</style>`;
  }

  return subHtml;
};

const pageReplacer = async (
  models: IModels,
  page: IPageDocument,
  siteId: string
) => {
  let html = page.html;

  const pages = await models.Pages.find({
    siteId,
    name: { $ne: page.name }
  });

  for (const p of pages) {
    const holder = `{{${p.name}}}`;

    if (html.includes(holder)) {
      let skip;
      let limit;

      // regex to find the entry limit
      const regex = `\\${holder}-([0-9]+):([0-9]+)\\b`;

      // find an entry limit from the html
      const match = html.match(regex) || [];

      // check the entry limit exists in page
      if (match[1] && match[2]) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);

        // remove an entry limit from html
        html = html.replace(`${holder}-${start}:${end}`, `${holder}`);

        limit = end - start + 1;
        skip = start - 1;
      }

      html = html.replace(
        new RegExp(holder, 'g'),
        await entryReplacer(models, siteId, p, limit, skip)
      );
    }
  }

  return html;
};

export { pageReplacer };
