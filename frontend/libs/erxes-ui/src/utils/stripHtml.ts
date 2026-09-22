export const stripHtml = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const { body } = new DOMParser().parseFromString(value, 'text/html');

  return (body.textContent || '').replaceAll(/\s+/g, ' ').trim();
};

export const getPersonName = (
  person: { firstName?: string | null; lastName?: string | null } | null,
  fallback: string,
) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(' ') || fallback;
