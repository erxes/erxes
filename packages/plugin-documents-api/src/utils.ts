import { sendCommonMessage } from "./messageBroker";

const coreUser = async (subdomain, document, itemId, replacedContents) => {
  const user = await sendCommonMessage({
    subdomain,
    serviceName: 'core',
    isRPC: true,
    action: 'users.findOne',
    data: {
      _id: itemId,
    },
  });

  let content = document.content;

  const details = user.details || {};

  content = content.replace(/{{ username }}/g, user.username);
  content = content.replace(/{{ email }}/g, user.email);
  content = content.replace(
    /{{ details.firstName }}/g,
    details.firstName
  );
  content = content.replace(
    /{{ details.lastName }}/g,
    details.lastName
  );
  content = content.replace(
    /{{ details.middleName }}/g,
    details.middleName
  );
  content = content.replace(
    /{{ details.position }}/g,
    details.position
  );
  content = content.replace(/{{ details.avatar }}/g, details.avatar);
  content = content.replace(
    /{{ details.description }}/g,
    details.description
  );

  for (const data of user.customFieldsData || []) {
    const regex = new RegExp(
      `{{ customFieldsData.${data.field} }}`,
      'g'
    );
    content = content.replace(regex, data.stringValue);
  }

  replacedContents.push(content);
  return replacedContents;
}
export const helper = async (subdomain, document, query) => {
  const { _id, copies, width, itemId } = query;
  let replacedContents: any[] = [];
  let scripts = '';
  let styles = '';
  let heads = '';

  if (document.contentType === 'core:user') {
    replacedContents = await coreUser(subdomain, document, itemId, replacedContents)
  } else {
    try {
      const serviceName = document.contentType.includes(':')
        ? document.contentType.substring(
          0,
          document.contentType.indexOf(':')
        )
        : document.contentType;

      replacedContents = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'documents.replaceContent',
        isRPC: true,
        data: {
          ...(query || {}),
          content: document.content,
        },
        timeout: 50000,
      });
    } catch (e) {
      replacedContents = [e.message];
    }
  }

  let results: string = '';

  const replacers = (document.replacer || '').split('\n');

  for (let replacedContent of replacedContents) {
    if (replacedContent.startsWith('::heads::')) {
      heads += replacedContent.replace('::heads::', '');
      continue;
    }

    if (replacedContent.startsWith('::scripts::')) {
      scripts += replacedContent.replace('::scripts::', '');
      continue;
    }

    if (replacedContent.startsWith('::styles::')) {
      styles += replacedContent.replace('::styles::', '');
      continue;
    }

    for (const replacer of replacers) {
      const [key, value] = replacer.split(',');

      if (key) {
        const regex = new RegExp(key, 'g');
        const tempContent = replacedContent;
        replacedContent = tempContent.replace(regex, value);
      }
    }

    if (copies) {
      results = `
             ${results}
              <div style="margin-right: 2mm; margin-bottom: 2mm; width: ${width}mm; float: left;">
                ${replacedContent}
              </div>
            `;
    } else {
      results = results + replacedContent;
    }
  }

  let multipliedResults: string[] = [
    `
      <head>
        <meta charset="utf-8">
        ${heads}
      </head>
    `,
  ];

  if (copies) {
    let i = 0;
    while (i < copies) {
      i++;
      multipliedResults.push(`
        <div style="margin-right: 2mm; margin-bottom: 2mm; float: left;">
        ${results}
        </div>
      `);
    }
  } else {
    multipliedResults = [results];
  }

  const style = `
    <style type="text/css">
      /*receipt*/
      html {
        color: #000;
        font-size: 11px;
        font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      }

      body {
        margin: 0;
      }

      table {
        width: 100%;
        max-width: 100%;
      }

      table tr:last-child td {
        border-bottom: 1px dashed #444;
      }

      table thead th {
        padding: 5px;
        border-top: 1px dashed #444;
        border-bottom: 1px dashed #444;
        text-align: left;
      }

      table tbody td {
        padding: 5px;
        text-align: left;
      }
      ${styles}
    </style>
  `;
  const script = `
      ${scripts}
  `;

  return { multipliedResults, style, script, }
}