const DOCUMENT_TYPE_ALIASES: Record<string, string[]> = {
  'core:contact.customer': ['core:customer', 'core:contacts.customers'],
  'core:contact.company': ['core:company', 'core:contacts.companies'],
};

export const documentContentTypes = (contentType: string): string[] => {
  for (const [canonical, aliases] of Object.entries(DOCUMENT_TYPE_ALIASES)) {
    if (contentType === canonical || aliases.includes(contentType)) {
      return [canonical, ...aliases];
    }
  }
  return [contentType];
};
