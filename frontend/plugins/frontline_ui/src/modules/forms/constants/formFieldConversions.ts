const TEXT_CUSTOMER_FIELDS = [
  'core:customer:firstName',
  'core:customer:middleName',
  'core:customer:lastName',
  'core:customer:description',
  'core:customer:email',
  'core:customer:phone',
];

export const canConvertFormField = (
  source: string,
  target: string,
): boolean => {
  const [basic, customer] = source.startsWith('core:customer:')
    ? [target, source]
    : [source, target];
  return (
    (['text', 'input', 'textarea'].includes(basic) &&
      TEXT_CUSTOMER_FIELDS.includes(customer)) ||
    (basic === 'number' && customer === 'core:customer:phone') ||
    (basic === 'date' && customer === 'core:customer:birthDate')
  );
};

export const getConvertedFieldValidation = (type: string): string => {
  if (type === 'core:customer:phone') return 'phone';
  if (type === 'core:customer:email') return 'email';
  if (type === 'core:customer:birthDate' || type === 'date') return 'date';
  return type === 'number' ? 'number' : '';
};
