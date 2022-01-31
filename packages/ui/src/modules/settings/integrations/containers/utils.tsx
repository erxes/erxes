import { cleanIntegrationKind } from 'erxes-ui/lib/utils';
import gql from 'graphql-tag';
import juice from 'juice';
import { generatePaginationParams } from 'modules/common/utils/router';
import { IEmail } from 'modules/inbox/types';
import sanitizeHtml from 'sanitize-html';
import { queries } from '../graphql';

export const cleanHtml = (content: string) => {
  // all style inlined
  const inlineStyledContent = juice(content);

  return sanitizeHtml(inlineStyledContent, {
    allowedTags: false,
    allowedAttributes: false,
    transformTags: {
      html: 'div',
      body: 'div'
    },

    // remove some unusual tags
    exclusiveFilter: n => {
      return (
        n.tag === 'meta' ||
        n.tag === 'head' ||
        n.tag === 'style' ||
        n.tag === 'base' ||
        n.tag === 'script'
      );
    }
  });
};

export const integrationsListParams = queryParams => ({
  ...generatePaginationParams(queryParams),
  searchValue: queryParams.searchValue,
  kind: queryParams.kind
});

export const getRefetchQueries = (kind: string) => {
  return [
    {
      query: gql(queries.integrations),
      variables: {
        ...integrationsListParams({}),
        kind
      }
    },
    {
      query: gql(queries.integrationTotalCount),
      variables: {
        ...integrationsListParams({}),
        kind
      }
    }
  ];
};

export const formatStr = (emailString?: string) => {
  return emailString ? emailString.split(/[ ,]+/) : [];
};

export { cleanIntegrationKind };

export const formatObj = (emailArray: IEmail[]) => {
  if (!emailArray || emailArray.length === 0) {
    return;
  }

  return emailArray ? emailArray.map(s => s.email).join(', ') : '';
};

export type GenerateMailParam = {
  fromEmail?: string;
  date?: string;
  to?: IEmail[];
  cc?: IEmail[];
  bcc?: IEmail[];
  subject?: string;
  body?: string;
  emailSignature?: string;
};

export const generateForwardMailContent = (params: GenerateMailParam) => {
  const {
    fromEmail,
    date,
    to,
    cc,
    bcc,
    subject,
    body,
    emailSignature
  } = params;

  const generatedContent = `
    <p>&nbsp;</p>
    ---------- Forwarded message ---------
    <br/>
    <b>From</b>: ${fromEmail}
    <br/>
    <b>Sent</b>: ${date}
    <br/>
    <b>To</b>: ${formatObj(to || [])}
    <br/>
    ${
      cc && cc.length > 0
        ? `
      <b>Cc</b>: ${formatObj(cc)}
      <br/>
      `
        : ''
    }
    ${
      bcc && bcc.length > 0
        ? `
      <b>Bcc</b>: ${formatObj(bcc)}
      <br/>
      `
        : ''
    }
    <b>Subject</b>: ${subject}
    ${body}
    <p>&nbsp;</p>
    ---
    <br/>
     ${emailSignature}
  `;

  return cleanHtml(generatedContent);
};

export const generatePreviousContents = msgs => {
  if (msgs.length === 0) {
    return '';
  }

  let content = '';

  msgs.forEach((msg, index) => {
    const marginSpace = index >= 7 ? 70 : index * 10;

    content += `
      <div style="margin-left:${marginSpace}px;border-left: 1px solid #ddd;padding-left: 1ex;">
        <div style="border-bottom:1px dotted #ddd;margin-bottom: 8px">
          <p>${msg.date} ${msg.fromEmail} wrote:</p>
          ${msg.body}
          <br/>
          <p>&nbsp;</p>
        </div>
        <p>&nbsp;</p>
      </div>
    `;
  });

  return cleanHtml(content);
};
