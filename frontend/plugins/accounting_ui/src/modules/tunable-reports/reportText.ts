import DOMPurify from 'dompurify';

export interface ReportOrganization {
  name?: string;
  phoneNumber?: string;
  email?: string;
}
export interface ReportTextContext {
  fromDate?: string;
  toDate?: string;
  organization?: ReportOrganization;
}

const FROM_DATE_TOKENS = new Set([
  'begin_date',
  'from_date',
  'from-date',
  'fromDate',
]);
const TO_DATE_TOKENS = new Set(['end_date', 'to_date', 'to-date', 'toDate']);
const ORGANIZATION_TOKENS = new Set([
  'name',
  'certificate_number',
  'country',
  'district',
  'committee',
  'street',
  'house',
  'door',
  'phone1',
  'phone2',
  'fax',
  'postal_code',
  'email',
  'activity_code',
  'header_company_info',
  'sub_companies_count',
  'investment_percent',
]);
const TOKEN_PATTERN = /\{([A-Za-z0-9_-]+)\}/g;
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ESCAPES[character]);

export const reportTextHasToken = (value: string, name: string): boolean =>
  value.includes(`{${name}}`);

export const fillReportPlaceholders = (
  value: string,
  { fromDate, toDate, organization }: ReportTextContext,
): string => {
  const organizationValues: Record<string, string | undefined> = {
    name: organization?.name,
    phone1: organization?.phoneNumber,
    email: organization?.email,
  };
  return value.replace(TOKEN_PATTERN, (token, name: string) => {
    if (FROM_DATE_TOKENS.has(name)) return fromDate ?? token;
    if (TO_DATE_TOKENS.has(name)) return toDate ?? token;
    if (organization && ORGANIZATION_TOKENS.has(name))
      return escapeHtml(organizationValues[name]?.trim() ?? '');
    return token;
  });
};

export const sanitizeReportHtml = (
  value: string,
  context: ReportTextContext,
): string =>
  DOMPurify.sanitize(fillReportPlaceholders(value, context), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style'],
  });

export const reportHtmlLines = (
  value: string,
  context: ReportTextContext,
): string[] => {
  const html = sanitizeReportHtml(value, context)
    .replace(/<br\b[^>]*>/gi, '\n')
    .replace(/<\/(?:p|div|tr|li|h[1-6])>/gi, '$&\n')
    .replace(/<\/t[dh]>/gi, '$& ');
  const text =
    new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .trim(),
    )
    .filter(Boolean);
};
