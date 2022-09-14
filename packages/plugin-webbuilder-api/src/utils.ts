import { IModels } from './connectionResolver';
import { IPageDocument } from './models/pages';
import { ISiteDocument } from './models/sites';

const pathReplacer = (subdomain: string, html: any, site: ISiteDocument) => {
  const siteHolder = `{{sitename}}`;
  const path = `{{pl:webbuilder}}/`;

  if (html.includes(siteHolder)) {
    html = html.replace(new RegExp(siteHolder, 'g'), site.name);
  }

  if (html.includes(path)) {
    if (site.domain && site.domain.includes('http')) {
      html = html.replace(new RegExp(path, 'g'), '');
    }

    // path replacer
    const replacer =
      subdomain === 'localhost' ? `pl:webbuilder/` : `gateway/pl:webbuilder/`;

    html = html.replace(new RegExp(path, 'g'), replacer);
  }

  return html;
};

const entryReplacer = async (
  models: IModels,
  subdomain: string,
  site: ISiteDocument,
  page: IPageDocument,
  limit: any,
  skip: any
) => {
  let subHtml = '';
  const html = pathReplacer(subdomain, page.html, site);

  if (page.name.includes('_entry')) {
    const contentTypeCode = page.name.replace('_entry', '');

    const contentType = await models.ContentTypes.findOne({
      siteId: site._id,
      code: contentTypeCode
    });

    const entries = await models.Entries.find({
      contentTypeId: contentType?._id
    })
      .limit(limit)
      .skip(skip);

    for (const entry of entries) {
      let entryHtml = html.replace(/{{entry._id}}/g, entry._id);

      for (const evalue of entry.values) {
        const { fieldCode, value } = evalue;

        const target = `{{entry.${fieldCode}}}`;

        entryHtml = entryHtml.replace(new RegExp(target, 'g'), value);
      }

      subHtml += entryHtml + `<style>${page.css}</style>`;
    }
  } else {
    subHtml = `${html} <style>${page.css}</style>`;
  }

  return subHtml;
};

const pageReplacer = async (
  models: IModels,
  subdomain: string,
  page: IPageDocument,
  site: ISiteDocument
) => {
  let html = pathReplacer(subdomain, page.html, site);

  const pages = await models.Pages.find({
    siteId: site._id,
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
        await entryReplacer(models, subdomain, site, p, limit, skip)
      );
    }
  }

  return html;
};

export { pageReplacer };
