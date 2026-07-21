import { getEnv } from 'erxes-api-shared/utils';
import { blocksToHtml } from '~/modules/documents/blocksToHtml';

const toDimension = (value?: number | string) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const num = typeof value === 'number' ? value : parseFloat(value);

  if (!isFinite(num) || num <= 0) {
    return undefined;
  }

  return `${num}mm`;
};

export const prepareContent = ({
  contents,
  config,
}: {
  contents: string[];
  config: Record<string, any>;
}) => {
  const { copies, paperWidth, paperHeight } = config || {};

  const width = toDimension(paperWidth ?? config?.width);
  const height = toDimension(paperHeight ?? config?.height);

  const pageStyle = width
    ? `
            @page {
              margin: 0;
            }
            html,
            body {
              margin: 0;
              padding: 0;
            }
            .label-item {
              width: ${width};${
        height ? `\n              min-height: ${height};` : ''
      }
              box-sizing: border-box;
              overflow: hidden;
            }
            img,
            svg {
              max-width: 100%;
              height: auto;
            }
            table {
              width: 100%;
              max-width: 100%;
              table-layout: fixed;
            }`
    : '';

  let htmlContents: string[] = [];

  for (const content of contents) {
    const html = blocksToHtml(content, {});

    htmlContents.push(
      width
        ? `<div class="label-item">${html}</div>`
        : `<div style="margin-bottom: 2mm">${html}</div>`,
    );
  }

  if (copies > 1) {
    const copiedContents = Array(copies - 1)
      .fill(htmlContents)
      .flat();

    htmlContents = [...htmlContents, ...copiedContents];
  }

  const tableStyles = width
    ? `
            table {
              border-collapse: collapse;
            }
            td {
              padding: 0;
              border: 0;
            }`
    : `
            table {
              border-collapse: collapse;
            }
            tr {
              box-sizing: border-box;
              border-width: 0;
              border-style: solid;
              border-color: #e5e7eb;
            }
            td {
              border: 1px solid #ddd;
              padding: 5px 10px;
            }`;

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${pageStyle}${tableStyles}
            blockquote {
              margin-left: 0;
              border-left: 2px solid rgb(125, 121, 122);
              color: #7d797a;
              padding-left: 1em;
            }
            .code {
              background-color: #161616;
              color: #fff;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          ${htmlContents.join('')}
        </body>
      </html>
    `;
};

export const replaceContent = async ({
  replacer,
  content,
  replacement,
  transform,
}: any) => {
  const blocks = JSON.parse(content);

  const processAttribute = (block, text) => {
    const { props, ...rest } = block;

    if (typeof text === 'string' && /<[a-z][\s\S]*>/i.test(text)) {
      const inlineHtml = text
        .replace(/<(p|div)(\s[^>]*)?>/gi, '<span$1>')
        .replace(/<\/(p|div)>/gi, '</span>');

      return {
        ...rest,
        type: 'rawHtml',
        content: undefined,
        props: {
          ...props,
          html: inlineHtml,
        },
      };
    }

    if (text && /\.(png|jpe?g|gif|webp|svg)$/i.test(text)) {
      const DOMAIN = getEnv({
        name: 'DOMAIN',
        defaultValue: 'http://localhost:4000',
      });

      return {
        ...rest,
        type: 'image',
        props: {
          ...props,
          name: text || '-',
          url: `${DOMAIN}/read-file?key=${text}`,
        },
      };
    }

    if (transform) {
      const transfomedBlock = transform(block, text);

      if (transfomedBlock) {
        return transfomedBlock;
      }
    }

    return {
      ...rest,
      type: 'text',
      text: text || '-',
    };
  };

  const processBlock = (block, blocks?: any[], parentIndex?: number) => {
    if (!block) return;

    if (block.type === 'attribute') {
      const { props } = block;

      const replacedValue = replacement(replacer, props?.value);

      if (blocks && parentIndex !== undefined) {
        blocks[parentIndex] = processAttribute(block, replacedValue);
      }

      return;
    }

    for (const key in block) {
      const value = block[key];

      if (Array.isArray(value)) {
        value.forEach((item, childIndex) =>
          processBlock(item, value, childIndex),
        );
      }

      if (value && typeof value === 'object') {
        processBlock(value);
      }
    }
  };

  blocks.forEach((block, index) => processBlock(block, blocks, index));

  return JSON.stringify(blocks);
};
