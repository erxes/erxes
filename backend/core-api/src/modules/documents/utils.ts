import { getEnv } from 'erxes-api-shared/utils';
import { blocksToHtml } from '~/modules/documents/blocksToHtml';

export const prepareContent = ({
  contents,
  config,
}: {
  contents: string[];
  config: Record<string, any>;
}) => {
  const { copies } = config;

  let htmlContents: string[] = [];

  for (const content of contents) {
    const html = blocksToHtml(content, {});

    htmlContents.push(`<div style="margin-bottom: 2mm">${html}</div>`);
  }

  if (copies > 1) {
    const copiedContents = Array(copies - 1)
      .fill(htmlContents)
      .flat();

    htmlContents = [...htmlContents, ...copiedContents];
  }

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
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
            }
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
