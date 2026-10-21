export const removeCodeFormattingFromHTML = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;

  template.content.querySelectorAll('code').forEach((code) => {
    // Retained marks belong to the editable document, not the exported code.
    code.replaceChildren(document.createTextNode(code.textContent ?? ''));
    code.removeAttribute('class');
  });

  return template.innerHTML;
};
