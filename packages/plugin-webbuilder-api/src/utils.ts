import { IModels } from './connectionResolver';
import { IPageDocument } from './models/pages';

const entryReplacer = async (
  models: IModels,
  siteId: string,
  p: IPageDocument
) => {
  let subHtml = '';

  if (p.name.includes('_entry')) {
    const contentTypeCode = p.name.replace('_entry', '');

    const contentType = await models.ContentTypes.findOne({
      siteId,
      code: contentTypeCode
    });

    const entries = await models.Entries.find({
      contentTypeId: contentType?._id
    });

    for (const entry of entries) {
      let entryHtml = p.html.replace('{{entry._id}}', entry._id);

      for (const evalue of entry.values) {
        const { fieldCode, value } = evalue;
        entryHtml = entryHtml.replace(`{{entry.${fieldCode}}}`, value);
      }

      subHtml += entryHtml + `<style>${p.css}</style>`;
    }
  } else {
    subHtml = `${p.html} <style>${p.css}</style>`;
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
      html = html.replace(holder, await entryReplacer(models, siteId, p));
    }
  }

  return html;
};

export { pageReplacer };
