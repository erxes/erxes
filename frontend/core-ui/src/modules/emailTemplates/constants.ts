/**
 * What a preview walks when the email repeats over a list. Real sends pass
 * the real list; here it only has to show the shape of a row.
 */
export const SAMPLE_EMAIL_PAYLOADS = {
  items: [
    {
      name: 'Sample product',
      description: 'What this item is',
      quantity: 2,
      unitPrice: 25000,
      amount: '50 000₮',
      imageUrl: '',
    },
    {
      name: 'Another product',
      description: 'A second row',
      quantity: 1,
      unitPrice: 12000,
      amount: '12 000₮',
      imageUrl: '',
    },
  ],
};
