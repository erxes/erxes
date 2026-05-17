import DOMPurify from 'dompurify';

export const openSanitizedWindow = (html: string): Window | null => {
  const win = window.open('', '_blank');
  if (!win) return null;
  const safeHtml = DOMPurify.sanitize(html, { WHOLE_DOCUMENT: true });
  win.document.write(safeHtml);
  win.document.close();
  return win;
};
