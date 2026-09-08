export const appendUnsubscribeFooter = (
  html: string,
  { unsubscribeUrl, postalAddress }: { unsubscribeUrl: string; postalAddress?: string },
): string => {
  const footer = `<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;"><tr><td style="padding:24px 24px 0 24px;text-align:center;font-size:12px;line-height:18px;color:#8898aa;">${
    postalAddress ? `${postalAddress}<br/>` : ''
  }You are receiving this email because you have signed up for our services.<br/><a href="${unsubscribeUrl}" style="color:#8898aa;text-decoration:underline;" rel="noopener" target="_blank">Unsubscribe</a></td></tr></table>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${footer}</body>`);
  }

  return `${html}${footer}`;
};
