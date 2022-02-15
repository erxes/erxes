import { IEmail } from '@erxes/ui-inbox/src/inbox/types';
import { cleanHtml } from '@erxes/ui-inbox/src/settings/integrations/containers/utils';

export const formatStr = (emailString?: string) => {
  return emailString ? emailString.split(/[ ,]+/) : [];
};

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
