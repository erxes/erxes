import { useMemo } from 'react';
import DOMPurify from 'dompurify';

export const ReportHtml = ({
  value,
  fromDate,
  toDate,
}: {
  value: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const html = useMemo(
    () =>
      DOMPurify.sanitize(
        value
          .replace(
            /\{(?:begin_date|from_date|from-date|fromDate)\}/g,
            (token) => fromDate ?? token,
          )
          .replace(
            /\{(?:end_date|to_date|to-date|toDate)\}/g,
            (token) => toDate ?? token,
          ),
        {
          USE_PROFILES: { html: true },
          FORBID_TAGS: ['style'],
        },
      ),
    [value, fromDate, toDate],
  );
  return (
    <div
      className="whitespace-pre-wrap [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
